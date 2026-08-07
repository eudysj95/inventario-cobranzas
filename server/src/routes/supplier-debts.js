import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest, conflict, isDateString, isUuid, notFound } from '../http.js';
import { withTransaction } from '../services/txn.js';

/**
 * Supplier debts routes (tasks 5.1 + 5.2):
 *   POST /api/supplier-debts               create {supplierName, amount,
 *                                          dueDate} — auto-upserts the supplier
 *                                          by name inside the TXN, balance opens
 *                                          at the full amount
 *   GET  /api/supplier-debts?status        list ordered by due date, with an
 *                                          overdue flag per row
 *   POST /api/supplier-debts/:id/pay       record a supplier_payment, reduce
 *                                          balance, close at 0 (TXN);
 *                                          overpayment rejected 400
 *   GET  /api/supplier-debts/due?horizonDays — open, balance > 0 debts due
 *                                          now or inside the horizon, ordered
 *                                          by due date with overdue/soon-due
 *                                          flags (task 5.2)
 *
 * No stock linkage and NO supplier messaging by design (spec: adding stock
 * never creates a supplier debt; no WhatsApp for suppliers).
 *
 * All routes require an authenticated session.
 */

const DEBT_STATUSES = new Set(['open', 'closed']);

// Base debt row joined with the supplier name plus an overdue flag (design:
// the list is "ordered by due_date + flags").
const DEBT_SELECT = `
  SELECT d.id, d.supplier_id, s.name AS supplier_name,
         d.amount, d.balance, d.due_date, d.status, d.created_at,
         (d.due_date < CURRENT_DATE) AS overdue
  FROM supplier_debts d
  JOIN suppliers s ON s.id = d.supplier_id
`;

/** pg returns NUMERIC as string; expose money as JSON numbers at the edge. */
function toDebt(row) {
  return { ...row, amount: Number(row.amount), balance: Number(row.balance) };
}

/** Round a money number to cents so NUMERIC(12,2) stores an exact value. */
function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

export default function supplierDebtsRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (req, res) => {
    const { supplierName, amount, dueDate } = req.body ?? {};

    if (typeof supplierName !== 'string' || supplierName.trim() === '') {
      return badRequest(res, 'supplierName must be a non-empty string');
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }
    const amountCents = Math.round(roundMoney(amount) * 100);
    if (amountCents <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }
    if (!isDateString(dueDate)) {
      return badRequest(res, 'dueDate must be a valid date (YYYY-MM-DD)');
    }

    const result = await withTransaction(pool, async (client) => {
      // Auto-upsert the supplier by trimmed name so debts always reference a
      // canonical supplier row (design: "auto-upserted by name").
      const name = supplierName.trim();
      const inserted = await client.query(
        `INSERT INTO suppliers (name) VALUES ($1)
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [name]
      );
      let supplierId = inserted.rows[0]?.id;
      if (!supplierId) {
        const existing = await client.query(
          'SELECT id FROM suppliers WHERE name = $1',
          [name]
        );
        supplierId = existing.rows[0].id;
      }

      // balance opens at the full amount; a debt is money owed, no stock.
      const debt = await client.query(
        `INSERT INTO supplier_debts (supplier_id, amount, balance, due_date)
         VALUES ($1, $2, $2, $3)
         RETURNING id`,
        [supplierId, (amountCents / 100).toFixed(2), dueDate]
      );

      const { rows } = await client.query(
        `${DEBT_SELECT} WHERE d.id = $1`,
        [debt.rows[0].id]
      );
      return { debt: rows[0] };
    });

    return res.status(201).json({ debt: toDebt(result.debt) });
  });

  router.get('/', async (req, res) => {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status !== undefined && status !== '') {
      if (!DEBT_STATUSES.has(status)) {
        return badRequest(res, `Invalid status: ${status}`);
      }
      params.push(status);
      where = ` WHERE d.status = $${params.length}`;
    }

    const { rows } = await pool.query(
      DEBT_SELECT + where + ' ORDER BY d.due_date ASC, d.created_at ASC',
      params
    );
    return res.status(200).json({ debts: rows.map(toDebt) });
  });

  router.post('/:id/pay', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Supplier debt not found');
    const { amount } = req.body ?? {};

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }
    const amountCents = Math.round(amount * 100);
    if (amountCents <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }

    const result = await withTransaction(pool, async (client) => {
      // The row lock serializes concurrent payments so the balance check
      // cannot race two payments into an overpayment (spec: overpayment MUST
      // be rejected).
      const { rows } = await client.query(
        'SELECT status, balance FROM supplier_debts WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (rows.length === 0) return { status: 'not-found' };
      if (rows[0].status !== 'open') return { status: 'not-open' };

      const balanceCents = Math.round(Number(rows[0].balance) * 100);
      if (amountCents > balanceCents) return { status: 'overpayment' };

      await client.query(
        'INSERT INTO supplier_payments (debt_id, amount) VALUES ($1, $2)',
        [req.params.id, (amountCents / 100).toFixed(2)]
      );

      // A debt's lifecycle ends at balance 0 (spec: same lifecycle as
      // customer debts — closed and excluded from due views).
      const newBalanceCents = balanceCents - amountCents;
      await client.query(
        `UPDATE supplier_debts
         SET balance = $2,
             status = CASE WHEN $3 THEN 'closed' ELSE status END
         WHERE id = $1`,
        [req.params.id, (newBalanceCents / 100).toFixed(2), newBalanceCents === 0]
      );

      const { rows: debtRows } = await client.query(
        `${DEBT_SELECT} WHERE d.id = $1`,
        [req.params.id]
      );
      return { status: 'ok', debt: debtRows[0] };
    });

    switch (result.status) {
      case 'not-found':
        return notFound(res, 'Supplier debt not found');
      case 'not-open':
        return conflict(res, 'Only open supplier debts can receive payments');
      case 'overpayment':
        return badRequest(
          res,
          'Payment exceeds the remaining balance of the supplier debt'
        );
      default:
        return res.status(200).json({ debt: toDebt(result.debt) });
    }
  });

  router.get('/due', async (req, res) => {
    const raw = req.query.horizonDays ?? 7;
    const horizonDays = Number(raw);
    if (!Number.isInteger(horizonDays) || horizonDays < 0) {
      return badRequest(res, 'horizonDays must be a non-negative integer');
    }

    // Due-payments view (task 5.2, design: "GET /api/supplier-debts/due?
    // horizonDays | due view"): open debts with remaining balance due now,
    // overdue, or inside the horizon — ordered by due date with
    // overdue/soon-due highlighting flags. Overdue items are INCLUDED
    // (due_date <= today + horizon). Closed or fully-paid debts never appear.
    const { rows } = await pool.query(
      `SELECT d.id, d.supplier_id, s.name AS supplier_name,
              d.amount, d.balance, d.due_date, d.status, d.created_at,
              (d.due_date < CURRENT_DATE) AS overdue,
              (d.due_date >= CURRENT_DATE
               AND d.due_date <= CURRENT_DATE + $1::int) AS soon_due
       FROM supplier_debts d
       JOIN suppliers s ON s.id = d.supplier_id
       WHERE d.status = 'open'
         AND d.balance > 0
         AND d.due_date <= CURRENT_DATE + $1::int
       ORDER BY d.due_date ASC, d.created_at ASC`,
      [horizonDays]
    );

    return res.status(200).json({
      debts: rows.map((r) => ({
        ...r,
        amount: Number(r.amount),
        balance: Number(r.balance),
      })),
    });
  });

  return router;
}
