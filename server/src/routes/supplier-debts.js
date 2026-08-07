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

  return router;
}
