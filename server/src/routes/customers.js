import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest, conflict, isUuid, notFound } from '../http.js';
import { withTransaction } from '../services/txn.js';

/**
 * Customers routes (task 3.2):
 *   GET    /api/customers?search  list with open balance SUM
 *   POST   /api/customers         create {name, phone?}
 *   PATCH  /api/customers/:id     update {name?, phone?} (null/'' clears phone)
 *   GET    /api/customers/:id     detail + open debts + payment history
 *   DELETE /api/customers/:id     only when no open apartados/debts (TXN)
 *
 * All routes require an authenticated session. The pool is injected, same
 * pattern as auth/health/products.
 */

// Open balance = what the customer currently owes: open credit-debt balances
// plus the remaining amount of pending apartados (agreed price minus
// cumulative apartado payments, amended per approved design amendment B).
const CUSTOMER_SELECT = `
  SELECT c.id, c.name, c.phone, c.created_at,
    (COALESCE(d.total_balance, 0) + COALESCE(a.total_remaining, 0))::numeric
      AS open_balance
  FROM customers c
  LEFT JOIN (
    SELECT customer_id, SUM(balance) AS total_balance
    FROM customer_debts
    WHERE status = 'open'
    GROUP BY customer_id
  ) d ON d.customer_id = c.id
  LEFT JOIN (
    SELECT ap.customer_id,
           SUM(GREATEST(ap.agreed_price - COALESCE(p.paid, 0), 0))
             AS total_remaining
    FROM apartados ap
    LEFT JOIN (
      SELECT apartado_id, SUM(amount) AS paid
      FROM apartado_payments
      GROUP BY apartado_id
    ) p ON p.apartado_id = ap.id
    WHERE ap.status = 'pending'
    GROUP BY ap.customer_id
  ) a ON a.customer_id = c.id
`;

const OPEN_DEBTS_SQL = `
  SELECT d.id, d.product_id, d.units, d.amount, d.balance, d.due_date,
         d.status, d.created_at, p.name AS product_name
  FROM customer_debts d
  JOIN products p ON p.id = d.product_id
  WHERE d.customer_id = $1 AND d.status = 'open'
  ORDER BY d.created_at ASC
`;

const PAYMENTS_SQL = `
  SELECT id, amount, paid_at, note
  FROM payments
  WHERE customer_id = $1
  ORDER BY paid_at DESC
`;

/** pg returns NUMERIC as string; expose money as JSON numbers at the edge. */
function toCustomer(row) {
  return { ...row, open_balance: Number(row.open_balance) };
}

function toOpenDebt(row) {
  return { ...row, amount: Number(row.amount), balance: Number(row.balance) };
}

function toPayment(row) {
  return { ...row, amount: Number(row.amount) };
}

/** Trim a phone; empty string and explicit null both mean "no phone". */
function normalizePhone(phone) {
  if (phone === undefined || phone === null) return null;
  if (typeof phone !== 'string') return undefined; // validation failure sentinel
  const trimmed = phone.trim();
  return trimmed === '' ? null : trimmed;
}

export default function customersRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const search = req.query.search ?? null;
    const { rows } = await pool.query(
      `${CUSTOMER_SELECT}
       WHERE ($1::text IS NULL OR c.name ILIKE '%' || $1 || '%')
       ORDER BY c.name ASC`,
      [search === '' ? null : search]
    );
    return res.status(200).json({ customers: rows.map(toCustomer) });
  });

  router.post('/', async (req, res) => {
    const { name, phone } = req.body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      return badRequest(res, 'Customer name is required');
    }
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone === undefined) {
      return badRequest(res, 'Phone must be a string or null');
    }

    const { rows } = await pool.query(
      'INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING id',
      [name.trim(), normalizedPhone]
    );

    const { rows: customerRows } = await pool.query(
      `${CUSTOMER_SELECT} WHERE c.id = $1`,
      [rows[0].id]
    );
    return res.status(201).json({ customer: toCustomer(customerRows[0]) });
  });

  router.patch('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Customer not found');
    const { name, phone } = req.body ?? {};

    const sets = [];
    const params = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return badRequest(res, 'Customer name is required');
      }
      params.push(name.trim());
      sets.push(`name = $${params.length}`);
    }
    if (phone !== undefined) {
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone === undefined) {
        return badRequest(res, 'Phone must be a string or null');
      }
      params.push(normalizedPhone);
      sets.push(`phone = $${params.length}`);
    }

    if (sets.length === 0) return badRequest(res, 'No fields to update');

    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE customers SET ${sets.join(', ')}
       WHERE id = $${params.length} RETURNING id`,
      params
    );
    if (rows.length === 0) return notFound(res, 'Customer not found');

    const { rows: customerRows } = await pool.query(
      `${CUSTOMER_SELECT} WHERE c.id = $1`,
      [rows[0].id]
    );
    return res.status(200).json({ customer: toCustomer(customerRows[0]) });
  });

  router.get('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Customer not found');

    const { rows } = await pool.query(
      `${CUSTOMER_SELECT} WHERE c.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Customer not found');

    const [debts, payments] = await Promise.all([
      pool.query(OPEN_DEBTS_SQL, [req.params.id]),
      pool.query(PAYMENTS_SQL, [req.params.id]),
    ]);

    return res.status(200).json({
      customer: toCustomer(rows[0]),
      open_debts: debts.rows.map(toOpenDebt),
      payments: payments.rows.map(toPayment),
    });
  });

  router.delete('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Customer not found');

    const result = await withTransaction(pool, async (client) => {
      const { rows } = await client.query(
        'SELECT id FROM customers WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (rows.length === 0) return { status: 'not-found' };

      const open = await client.query(
        `SELECT
           (SELECT COUNT(*) FROM apartados a
             WHERE a.customer_id = $1 AND a.status = 'pending')
           +
           (SELECT COUNT(*) FROM customer_debts d
             WHERE d.customer_id = $1 AND d.status = 'open') AS n`,
        [req.params.id]
      );
      if (Number(open.rows[0].n) > 0) return { status: 'has-open-records' };

      try {
        await client.query('DELETE FROM customers WHERE id = $1', [
          req.params.id,
        ]);
      } catch (err) {
        // Paid apartados, closed debts, or payment history still reference
        // the customer (FK RESTRICT); translate into a clean conflict.
        if (err.code === '23503') return { status: 'has-history' };
        throw err;
      }
      return { status: 'ok' };
    });

    switch (result.status) {
      case 'not-found':
        return notFound(res, 'Customer not found');
      case 'has-open-records':
        return conflict(
          res,
          'Cannot delete a customer with open apartados or debts'
        );
      case 'has-history':
        return conflict(
          res,
          'Cannot delete a customer with payment or sales history'
        );
      default:
        return res.status(200).json({ ok: true });
    }
  });

  return router;
}
