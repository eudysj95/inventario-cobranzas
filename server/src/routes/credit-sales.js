import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth } from '../auth.js';
import { badRequest, isDateString, isUuid, notFound } from '../http.js';
import { withTransaction } from '../services/txn.js';
import { toDateString } from '../lib/dates.js';

/**
 * Credit-sales routes (task 4.3):
 *   POST /api/credit-sales    create {customerId, lines:[{productId, units,
 *                             price?}], dueDate?} — decrements stock per line
 *                             in ONE TXN and inserts one debt row per line
 *                             grouped by a shared sale_id; any failing line
 *                             rolls back the whole sale (atomicity)
 *   GET  /api/credit-sales/:saleId — sale header + its debt lines
 *
 * All routes require an authenticated session.
 */

/** pg returns NUMERIC as string; expose money as JSON numbers at the edge. */
function toLine(row) {
  return { ...row, amount: Number(row.amount), balance: Number(row.balance) };
}

/**
 * Abort a credit-sale TXN with a specific failure. Throwing (instead of
 * returning a status) is what makes withTransaction ROLL BACK: a normally
 * returned value is COMMITTED, and by the time a later line fails, earlier
 * lines already decremented stock — only a throw preserves the spec's
 * "on any failure neither change persists".
 */
class CreditSaleAbort extends Error {
  constructor(status) {
    super(status);
    this.status = status;
  }
}

/**
 * Fetch the canonical sale shape for a sale_id: header (customer + total) and
 * its debt lines ordered by (created_at, id). Returns null when unknown.
 */
async function fetchSale(pool, saleId) {
  const { rows } = await pool.query(
    `SELECT d.sale_id AS id, d.customer_id, c.name AS customer_name,
            MIN(d.created_at) AS created_at, SUM(d.amount) AS total
     FROM customer_debts d
     JOIN customers c ON c.id = d.customer_id
     WHERE d.sale_id = $1
     GROUP BY d.sale_id, d.customer_id, c.name`,
    [saleId]
  );
  if (rows.length === 0) return null;

  const { rows: lines } = await pool.query(
    `SELECT d.id, d.product_id, p.name AS product_name, d.units, d.amount,
            d.balance, d.due_date, d.status
     FROM customer_debts d
     JOIN products p ON p.id = d.product_id
     WHERE d.sale_id = $1
     ORDER BY d.created_at ASC, d.id ASC`,
    [saleId]
  );

  return {
    id: rows[0].id,
    customer_id: rows[0].customer_id,
    customer_name: rows[0].customer_name,
    created_at: rows[0].created_at,
    total: Number(rows[0].total),
    lines: lines.map((r) => ({
      ...toLine(r),
      due_date: toDateString(r.due_date),
    })),
  };
}

/** Round a money number to cents so NUMERIC(12,2) stores an exact value. */
function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Fetch a paginated list of credit sales.
 * Returns { sales: [...], total: number }.
 */
async function fetchSalesList(pool, { limit = 50, offset = 0, customerId } = {}) {
  const params = [];
  let where = '';
  let paramIndex = 1;

  if (customerId) {
    where = `WHERE d.customer_id = $${paramIndex}`;
    params.push(customerId);
    paramIndex++;
  }

  // Total count
  const countQuery = `
    SELECT COUNT(DISTINCT d.sale_id) AS total
    FROM customer_debts d
    JOIN customers c ON c.id = d.customer_id
    ${where}
  `;
  const { rows: countRows } = await pool.query(countQuery, params);
  const total = Number(countRows[0].total);

  // Sales list with aggregation
  params.push(limit, offset);
  const listQuery = `
    SELECT d.sale_id AS id, d.customer_id, c.name AS customer_name,
           MIN(d.created_at) AS created_at, SUM(d.amount) AS total,
           COUNT(*) AS line_count
    FROM customer_debts d
    JOIN customers c ON c.id = d.customer_id
    ${where}
    GROUP BY d.sale_id, d.customer_id, c.name
    ORDER BY MIN(d.created_at) DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const { rows } = await pool.query(listQuery, params);

  const sales = rows.map((r) => ({
    id: r.id,
    customer_id: r.customer_id,
    customer_name: r.customer_name,
    created_at: r.created_at,
    total: Number(r.total),
    line_count: Number(r.line_count),
  }));

  return { sales, total };
}

export default function creditSalesRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (req, res) => {
    const { customerId, lines, dueDate } = req.body ?? {};

    if (typeof customerId !== 'string' || !isUuid(customerId)) {
      return badRequest(res, 'customerId must be a valid UUID');
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      return badRequest(res, 'lines must be a non-empty array');
    }
    if (dueDate !== undefined && dueDate !== null && !isDateString(dueDate)) {
      return badRequest(res, 'dueDate must be a valid date (YYYY-MM-DD)');
    }

    // Validate every line up front so a bad line is rejected before the TXN
    // and the whole request is refused with a precise message.
    const normalized = [];
    for (const [idx, line] of lines.entries()) {
      if (!line || typeof line !== 'object') {
        return badRequest(res, `lines[${idx}] must be an object`);
      }
      const { productId, units, price } = line;
      if (typeof productId !== 'string' || !isUuid(productId)) {
        return badRequest(res, `lines[${idx}].productId must be a valid UUID`);
      }
      if (!Number.isInteger(units) || units <= 0) {
        return badRequest(res, `lines[${idx}].units must be a positive integer`);
      }
      if (
        price !== undefined &&
        (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
      ) {
        return badRequest(
          res,
          `lines[${idx}].price must be a non-negative number`
        );
      }
      normalized.push({ productId, units, price });
    }

    // Grouping key generated server-side so every line of this sale shares it.
    const saleId = randomUUID();

    let result;
    try {
      result = await withTransaction(pool, async (client) => {
        const customer = await client.query(
          'SELECT 1 FROM customers WHERE id = $1',
          [customerId]
        );
        if (customer.rows.length === 0) return { status: 'customer-missing' };

        for (const line of normalized) {
          // Guarded decrement per line: only touched when enough stock exists.
          const stock = await client.query(
            `UPDATE products SET quantity = quantity - $1, updated_at = now()
             WHERE id = $2 AND quantity >= $1
             RETURNING id`,
            [line.units, line.productId]
          );
          if (stock.rows.length === 0) {
            const exists = await client.query(
              'SELECT 1 FROM products WHERE id = $1',
              [line.productId]
            );
            if (exists.rows.length === 0) {
              throw new CreditSaleAbort('product-missing');
            }
            throw new CreditSaleAbort('insufficient-stock');
          }

          // Line price: explicit value wins, otherwise the catalog price.
          let unitPrice = line.price;
          if (unitPrice === undefined) {
            const { rows: productRows } = await client.query(
              'SELECT price FROM products WHERE id = $1',
              [line.productId]
            );
            unitPrice = Number(productRows[0].price);
          }
          const amount = roundMoney(line.units * unitPrice);

          await client.query(
            `INSERT INTO customer_debts
               (customer_id, product_id, sale_id, units, amount, balance, due_date)
             VALUES ($1, $2, $3, $4, $5, $5, $6)`,
            [
              customerId,
              line.productId,
              saleId,
              line.units,
              amount.toFixed(2),
              dueDate ?? null,
            ]
          );
        }
        return { status: 'ok' };
      });
    } catch (err) {
      // CreditSaleAbort already rolled the TXN back inside withTransaction.
      if (err instanceof CreditSaleAbort) {
        if (err.status === 'product-missing') {
          return notFound(res, 'Product not found');
        }
        return badRequest(
          res,
          'Insufficient stock for one or more lines — nothing was recorded'
        );
      }
      throw err;
    }

    switch (result.status) {
      case 'customer-missing':
        return notFound(res, 'Customer not found');
      default: {
        const sale = await fetchSale(pool, saleId);
        return res.status(201).json({ sale });
      }
    }
  });

  router.get('/', async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const customerId = req.query.customerId;

    if (customerId && !isUuid(customerId)) {
      return badRequest(res, 'customerId must be a valid UUID');
    }

    const { sales, total } = await fetchSalesList(pool, { limit, offset, customerId });
    return res.status(200).json({ sales, total, limit, offset });
  });

  router.get('/:saleId', async (req, res) => {
    if (!isUuid(req.params.saleId)) return notFound(res, 'Credit sale not found');
    const sale = await fetchSale(pool, req.params.saleId);
    if (!sale) return notFound(res, 'Credit sale not found');
    return res.status(200).json({ sale });
  });

  return router;
}
