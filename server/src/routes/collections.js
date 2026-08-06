import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest } from '../http.js';

/**
 * Collections routes (task 4.5):
 *   GET /api/collections/due?horizonDays=7 — customers with apartado or
 *       credit items due now, overdue, or inside the horizon. Shape per
 *       design: {customerId, name, phone, totalOpen,
 *                items:[{type: apartado|credit, amount, dueDate}], overdue}
 *
 * Selection rule (spec: "no overdue or soon-due debts -> no link"): an item
 * is collected when it has a due date and due_date <= today + horizonDays
 * (this includes overdue items). Items without a due date are NOT surfaced —
 * the design open question "credit debts without due_date still message
 * amount-only" was resolved toward the strict spec scenario; flipping that
 * only means relaxing the IS NOT NULL filter. Paid apartados and closed
 * debts never appear. `overdue` is true when any collected item is past due.
 *
 * All routes require an authenticated session.
 */
export default function collectionsRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.get('/due', async (req, res) => {
    const raw = req.query.horizonDays ?? 7;
    const horizonDays = Number(raw);
    if (!Number.isInteger(horizonDays) || horizonDays < 0) {
      return badRequest(res, 'horizonDays must be a non-negative integer');
    }

    const { rows } = await pool.query(
      `WITH items AS (
         SELECT a.customer_id, 'apartado' AS type,
                GREATEST(a.agreed_price - COALESCE(ap.paid, 0), 0) AS amount,
                a.due_date
         FROM apartados a
         LEFT JOIN (
           SELECT apartado_id, SUM(amount) AS paid
           FROM apartado_payments
           GROUP BY apartado_id
         ) ap ON ap.apartado_id = a.id
         WHERE a.status = 'pending'
           AND a.due_date IS NOT NULL
           AND a.due_date <= CURRENT_DATE + $1::int
           AND GREATEST(a.agreed_price - COALESCE(ap.paid, 0), 0) > 0
         UNION ALL
         SELECT d.customer_id, 'credit' AS type, d.balance AS amount, d.due_date
         FROM customer_debts d
         WHERE d.status = 'open'
           AND d.due_date IS NOT NULL
           AND d.due_date <= CURRENT_DATE + $1::int
           AND d.balance > 0
       )
       SELECT c.id AS customer_id, c.name, c.phone,
              SUM(i.amount)::numeric AS total_open,
              BOOL_OR(i.due_date < CURRENT_DATE) AS overdue,
              JSON_AGG(
                JSON_BUILD_OBJECT('type', i.type, 'amount', i.amount, 'dueDate', i.due_date)
                ORDER BY i.due_date ASC, i.type ASC
              ) AS items
       FROM customers c
       JOIN items i ON i.customer_id = c.id
       GROUP BY c.id, c.name, c.phone
       ORDER BY c.name ASC`,
      [horizonDays]
    );

    return res.status(200).json({
      customers: rows.map((r) => ({
        customerId: r.customer_id,
        name: r.name,
        phone: r.phone,
        totalOpen: Number(r.total_open),
        overdue: r.overdue,
        // items is already parsed JSON (array of {type, amount, dueDate}).
        items: r.items,
      })),
    });
  });

  return router;
}
