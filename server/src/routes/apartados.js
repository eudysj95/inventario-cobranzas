import { Router } from 'express';
import { requireAuth } from '../auth.js';
import {
  badRequest,
  conflict,
  isDateString,
  isUuid,
  notFound,
} from '../http.js';
import { withTransaction } from '../services/txn.js';
import { toDateString } from '../lib/dates.js';

/**
 * Apartados routes (tasks 4.1 + 4.2):
 *   POST /api/apartados            create {customerId, productId, units,
 *                                  agreedPrice, dueDate} — decrements stock
 *                                  in the same TXN (guarded quantity >= units)
 *   POST /api/apartados/:id/cancel restore reserved units to stock (TXN);
 *                                  409 unless the apartado is 'pending'
 *   POST /api/apartados/:id/pay    record an apartado_payments row; reject
 *                                  cumulative > agreed_price (400); flip to
 *                                  'paid' when cumulative >= agreed_price;
 *                                  NO stock change (approved amendment B)
 *   GET  /api/apartados?status&customerId — list with paid_total/remaining
 *
 * All routes require an authenticated session (spec: every business endpoint
 * answers 401 without one).
 */

const APARTADO_STATUSES = new Set(['pending', 'paid', 'cancelled']);

// Base apartado row: joined customer/product names plus cumulative payments
// (amendment B) and remaining owed (agreed price minus what was paid).
const APARTADO_SELECT = `
  SELECT a.id, a.customer_id, c.name AS customer_name,
         a.product_id, p.name AS product_name,
         a.units, a.agreed_price, a.due_date, a.status, a.created_at, a.updated_at,
         COALESCE(ap.paid, 0) AS paid_total,
         GREATEST(a.agreed_price - COALESCE(ap.paid, 0), 0) AS remaining
  FROM apartados a
  JOIN customers c ON c.id = a.customer_id
  JOIN products p ON p.id = a.product_id
  LEFT JOIN (
    SELECT apartado_id, SUM(amount) AS paid
    FROM apartado_payments
    GROUP BY apartado_id
  ) ap ON ap.apartado_id = a.id
`;

/** pg returns NUMERIC as string; expose money as JSON numbers at the edge. */
function toApartado(row) {
  return {
    ...row,
    agreed_price: Number(row.agreed_price),
    paid_total: Number(row.paid_total),
    remaining: Number(row.remaining),
    due_date: toDateString(row.due_date),
  };
}

/** Round a money number to cents so NUMERIC(12,2) stores an exact value. */
function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

export default function apartadosRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (req, res) => {
    const { customerId, productId, units, agreedPrice, dueDate } =
      req.body ?? {};

    if (typeof customerId !== 'string' || !isUuid(customerId)) {
      return badRequest(res, 'customerId must be a valid UUID');
    }
    if (typeof productId !== 'string' || !isUuid(productId)) {
      return badRequest(res, 'productId must be a valid UUID');
    }
    if (!Number.isInteger(units) || units <= 0) {
      return badRequest(res, 'units must be a positive integer');
    }
    if (
      typeof agreedPrice !== 'number' ||
      !Number.isFinite(agreedPrice) ||
      agreedPrice <= 0
    ) {
      return badRequest(res, 'agreedPrice must be a positive number');
    }
    if (!isDateString(dueDate)) {
      return badRequest(res, 'dueDate must be a valid date (YYYY-MM-DD)');
    }

    const result = await withTransaction(pool, async (client) => {
      const customer = await client.query(
        'SELECT 1 FROM customers WHERE id = $1',
        [customerId]
      );
      if (customer.rows.length === 0) return { status: 'customer-missing' };

      // Guarded decrement: the row is only touched when enough stock exists
      // (spec: quantity MUST NOT go negative; stock reversal integrity).
      const stock = await client.query(
        `UPDATE products SET quantity = quantity - $1, updated_at = now()
         WHERE id = $2 AND quantity >= $1
         RETURNING id`,
        [units, productId]
      );
      if (stock.rows.length === 0) {
        const exists = await client.query(
          'SELECT 1 FROM products WHERE id = $1',
          [productId]
        );
        if (exists.rows.length === 0) return { status: 'product-missing' };
        return { status: 'insufficient-stock' };
      }

      const { rows } = await client.query(
        `INSERT INTO apartados (customer_id, product_id, units, agreed_price, due_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [customerId, productId, units, roundMoney(agreedPrice), dueDate]
      );

      const { rows: apartadoRows } = await client.query(
        `${APARTADO_SELECT} WHERE a.id = $1`,
        [rows[0].id]
      );
      return { status: 'ok', apartado: apartadoRows[0] };
    });

    switch (result.status) {
      case 'customer-missing':
        return notFound(res, 'Customer not found');
      case 'product-missing':
        return notFound(res, 'Product not found');
      case 'insufficient-stock':
        return badRequest(res, 'Insufficient stock for the requested units');
      default:
        return res.status(201).json({ apartado: toApartado(result.apartado) });
    }
  });

  router.post('/:id/cancel', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Apartado not found');

    const result = await withTransaction(pool, async (client) => {
      // Lock the row so a concurrent cancel/pay cannot double-restore stock.
      const { rows } = await client.query(
        'SELECT status, units, product_id FROM apartados WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (rows.length === 0) return { status: 'not-found' };
      if (rows[0].status !== 'pending') return { status: 'not-pending' };

      // Cancellation reverses creation: return the reserved units to stock.
      await client.query(
        'UPDATE products SET quantity = quantity + $1, updated_at = now() WHERE id = $2',
        [rows[0].units, rows[0].product_id]
      );
      await client.query(
        `UPDATE apartados SET status = 'cancelled', updated_at = now() WHERE id = $1`,
        [req.params.id]
      );

      const { rows: apartadoRows } = await client.query(
        `${APARTADO_SELECT} WHERE a.id = $1`,
        [req.params.id]
      );
      return { status: 'ok', apartado: apartadoRows[0] };
    });

    switch (result.status) {
      case 'not-found':
        return notFound(res, 'Apartado not found');
      case 'not-pending':
        return conflict(res, 'Only pending apartados can be cancelled');
      default:
        return res.status(200).json({ apartado: toApartado(result.apartado) });
    }
  });

  router.post('/:id/pay', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Apartado not found');
    const { amount, note } = req.body ?? {};

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }
    if (note !== undefined && note !== null && typeof note !== 'string') {
      return badRequest(res, 'note must be a string or null');
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }

    const result = await withTransaction(pool, async (client) => {
      // The row lock serializes concurrent payments on the same apartado so
      // the cumulative check cannot race two abonos into an overpayment.
      const { rows } = await client.query(
        'SELECT status, agreed_price FROM apartados WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (rows.length === 0) return { status: 'not-found' };
      if (rows[0].status !== 'pending') return { status: 'not-pending' };

      const agreedCents = Math.round(Number(rows[0].agreed_price) * 100);
      const paid = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS paid
         FROM apartado_payments WHERE apartado_id = $1`,
        [req.params.id]
      );
      const paidCents = Math.round(Number(paid.rows[0].paid) * 100);

      const newCents = paidCents + amountCents;
      // Amendment B: cumulative payments may never exceed the agreed price.
      if (newCents > agreedCents) return { status: 'overpayment' };

      await client.query(
        `INSERT INTO apartado_payments (apartado_id, amount, note)
         VALUES ($1, $2, $3)`,
        [req.params.id, (amountCents / 100).toFixed(2), note ?? null]
      );

      // Full payment closes the apartado; units stay out of stock (sold).
      if (newCents >= agreedCents) {
        await client.query(
          `UPDATE apartados SET status = 'paid', updated_at = now() WHERE id = $1`,
          [req.params.id]
        );
      }

      const { rows: apartadoRows } = await client.query(
        `${APARTADO_SELECT} WHERE a.id = $1`,
        [req.params.id]
      );
      return { status: 'ok', apartado: apartadoRows[0] };
    });

    switch (result.status) {
      case 'not-found':
        return notFound(res, 'Apartado not found');
      case 'not-pending':
        return conflict(res, 'Only pending apartados can receive payments');
      case 'overpayment':
        return badRequest(
          res,
          'Payment exceeds the remaining balance of the apartado'
        );
      default:
        return res.status(200).json({ apartado: toApartado(result.apartado) });
    }
  });

  router.get('/', async (req, res) => {
    const { status, customerId } = req.query;
    const where = [];
    const params = [];

    if (status !== undefined && status !== '') {
      if (!APARTADO_STATUSES.has(status)) {
        return badRequest(res, `Invalid status: ${status}`);
      }
      params.push(status);
      where.push(`a.status = $${params.length}`);
    }
    if (customerId !== undefined && customerId !== '') {
      if (!isUuid(customerId)) {
        return badRequest(res, 'customerId must be a valid UUID');
      }
      params.push(customerId);
      where.push(`a.customer_id = $${params.length}`);
    }

    const sql =
      APARTADO_SELECT +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ' ORDER BY a.created_at DESC';

    const { rows } = await pool.query(sql, params);
    return res.status(200).json({ apartados: rows.map(toApartado) });
  });

  return router;
}
