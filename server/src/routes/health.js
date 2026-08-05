import { Router } from 'express';
import { isDbUp } from '../db.js';

/**
 * GET /health — keep-alive probe (Uptime Robot).
 * Always answers 200 so the monitor sees the service up; the `ok` flag
 * reflects database reachability and `db` reports 'up' | 'down'.
 *
 * The pool is injected so tests can probe their own (test) database.
 */
export default function healthRouter(pool) {
  const router = Router();

  router.get('/', async (_req, res) => {
    let dbUp = false;
    try {
      dbUp = await isDbUp(pool);
    } catch {
      dbUp = false;
    }
    res.status(200).json({ ok: dbUp, db: dbUp ? 'up' : 'down' });
  });

  return router;
}
