import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest, isUuid, notFound } from '../http.js';
import { withTransaction } from '../services/txn.js';
import { allocateFifo } from '../lib/fifo.js';

/**
 * Payments routes (task 4.4):
 *   POST /api/payments    {customerId, amount} — FIFO abono: locks the
 *                         customer's open debts in (created_at, id) order,
 *                         rejects amounts above the total remaining balance,
 *                         allocates oldest-first across debts, writes the
 *                         payment + per-debt allocations and closes each debt
 *                         as its balance reaches 0 — all in ONE TXN
 *   GET  /api/payments?customerId — payment history with allocations
 *
 * All routes require an authenticated session.
 */

// Money stays exact through the FIFO math: convert to integer cents for
// allocation, and write back NUMERIC as fixed 2-decimal strings.
const toCents = (n) => Math.round(n * 100);
const toMoney = (cents) => (cents / 100).toFixed(2);

export default function paymentsRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (req, res) => {
    const { customerId, amount, note } = req.body ?? {};

    if (typeof customerId !== 'string' || !isUuid(customerId)) {
      return badRequest(res, 'customerId must be a valid UUID');
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }
    if (note !== undefined && note !== null && typeof note !== 'string') {
      return badRequest(res, 'note must be a string or null');
    }

    const amountCents = toCents(amount);
    if (amountCents <= 0) {
      return badRequest(res, 'amount must be a positive number');
    }

    const result = await withTransaction(pool, async (client) => {
      const customer = await client.query(
        'SELECT 1 FROM customers WHERE id = $1',
        [customerId]
      );
      if (customer.rows.length === 0) return { status: 'customer-missing' };

      // Lock the customer's open debts in FIFO order so concurrent payments
      // serialize on the same rows and two abonos cannot overshoot a balance
      // (design: lock open debts ordered by created_at, id).
      const { rows: debts } = await client.query(
        `SELECT id, balance FROM customer_debts
         WHERE customer_id = $1 AND status = 'open'
         ORDER BY created_at ASC, id ASC
         FOR UPDATE`,
        [customerId]
      );

      const totalCents = debts.reduce((sum, d) => sum + toCents(d.balance), 0);
      if (totalCents === 0) return { status: 'no-open-debts' };
      if (amountCents > totalCents) return { status: 'overpayment' };

      const { rows: paymentRows } = await client.query(
        'INSERT INTO payments (customer_id, amount, note) VALUES ($1, $2, $3) RETURNING id',
        [customerId, toMoney(amountCents), note ?? null]
      );
      const paymentId = paymentRows[0].id;

      // FIFO: oldest debt first; a payment MAY span multiple debts, closing
      // older ones before touching newer ones (spec scenario: 60 on 50+40).
      const { allocations, updates } = allocateFifo(debts, amountCents);

      const responseAllocations = [];
      for (let i = 0; i < allocations.length; i++) {
        const alloc = allocations[i];
        const update = updates[i];

        await client.query(
          'INSERT INTO payment_allocations (payment_id, debt_id, amount) VALUES ($1, $2, $3)',
          [paymentId, alloc.debt_id, toMoney(alloc.amountCents)]
        );
        responseAllocations.push({
          debt_id: alloc.debt_id,
          amount: Number(toMoney(alloc.amountCents)),
        });

        if (update.newBalanceCents === 0) {
          // Debt lifecycle ends at balance 0: closed and out of future views.
          await client.query(
            `UPDATE customer_debts
             SET balance = 0, status = 'closed', closed_at = now()
             WHERE id = $1`,
            [update.debt_id]
          );
        } else {
          await client.query(
            'UPDATE customer_debts SET balance = $2 WHERE id = $1',
            [update.debt_id, toMoney(update.newBalanceCents)]
          );
        }
      }

      return { status: 'ok', paymentId, allocations: responseAllocations };
    });

    switch (result.status) {
      case 'customer-missing':
        return notFound(res, 'Customer not found');
      case 'no-open-debts':
        return badRequest(res, 'Customer has no open debts');
      case 'overpayment':
        return badRequest(
          res,
          "Payment exceeds the customer's remaining balance"
        );
      default: {
        const { rows: paymentRows } = await pool.query(
          `SELECT p.id, p.customer_id, c.name AS customer_name,
                  p.amount, p.paid_at, p.note
           FROM payments p
           JOIN customers c ON c.id = p.customer_id
           WHERE p.id = $1`,
          [result.paymentId]
        );
        const payment = paymentRows[0];
        return res.status(201).json({
          payment: { ...payment, amount: Number(payment.amount) },
          allocations: result.allocations,
        });
      }
    }
  });

  router.get('/', async (req, res) => {
    const customerId = req.query.customerId ?? null;
    const where = [];
    const params = [];

    if (customerId !== null && customerId !== '') {
      if (!isUuid(customerId)) {
        return badRequest(res, 'customerId must be a valid UUID');
      }
      params.push(customerId);
      where.push('p.customer_id = $1');
    }

    const { rows } = await pool.query(
      `SELECT p.id, p.customer_id, c.name AS customer_name,
              p.amount, p.paid_at, p.note
       FROM payments p
       JOIN customers c ON c.id = p.customer_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY p.paid_at DESC`,
      params
    );
    const payments = rows.map((r) => ({ ...r, amount: Number(r.amount) }));
    if (payments.length === 0) {
      return res.status(200).json({ payments: [] });
    }

    // Attach each payment's FIFO allocations in one follow-up query.
    const { rows: allocations } = await pool.query(
      `SELECT pa.payment_id, pa.debt_id, pa.amount
       FROM payment_allocations pa
       WHERE pa.payment_id = ANY($1::uuid[])
       ORDER BY pa.payment_id ASC`,
      [payments.map((p) => p.id)]
    );
    const byPayment = new Map();
    for (const a of allocations) {
      if (!byPayment.has(a.payment_id)) byPayment.set(a.payment_id, []);
      byPayment
        .get(a.payment_id)
        .push({ debt_id: a.debt_id, amount: Number(a.amount) });
    }
    for (const p of payments) {
      p.allocations = byPayment.get(p.id) ?? [];
    }

    return res.status(200).json({ payments });
  });

  return router;
}
