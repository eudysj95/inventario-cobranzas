import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest } from '../http.js';

/**
 * Suppliers routes (task 5.1):
 *   GET  /api/suppliers?search  list suppliers (optional name search)
 *   POST /api/suppliers         auto-upsert by name {name}: creates the
 *                               supplier or returns the existing row — the
 *                               endpoint is idempotent (design: suppliers are
 *                               "auto-upserted by name"; the same upsert is
 *                               reused inside POST /api/supplier-debts so a
 *                               debt never carries free-text names).
 *
 * Suppliers are a pure debt registry by design: no stock linkage and NO
 * supplier messaging (the "no messaging" requirement of task 5.2 is met by
 * absence — nothing in this domain generates WhatsApp links).
 *
 * All routes require an authenticated session.
 */
export default function suppliersRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const { search } = req.query;
    const params = [];
    let where = '';
    if (search !== undefined && search !== '') {
      params.push(`%${search}%`);
      where = ' WHERE name ILIKE $1';
    }
    const { rows } = await pool.query(
      `SELECT id, name FROM suppliers${where} ORDER BY name ASC`,
      params
    );
    return res.status(200).json({ suppliers: rows });
  });

  router.post('/', async (req, res) => {
    const { name } = req.body ?? {};
    if (typeof name !== 'string' || name.trim() === '') {
      return badRequest(res, 'name must be a non-empty string');
    }
    const trimmed = name.trim();

    // Auto-upsert: INSERT ... ON CONFLICT DO NOTHING returns a row only when
    // the name is new. Existing names fall through to a SELECT and answer 200
    // with the same supplier — calling twice never duplicates (design: the
    // suppliers table is auto-upserted by name).
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING id, name`,
      [trimmed]
    );
    if (rows.length === 0) {
      const { rows: existing } = await pool.query(
        'SELECT id, name FROM suppliers WHERE name = $1',
        [trimmed]
      );
      return res.status(200).json({ supplier: existing[0] });
    }
    return res.status(201).json({ supplier: rows[0] });
  });

  return router;
}
