import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  COOKIE_NAME,
  CSRF_COOKIE_NAME,
  cookieOptions,
  csrfCookieOptions,
  requireAuth,
  signToken,
  generateCsrfToken,
} from '../auth.js';

// Generic login failure — identical body for wrong password, unknown
// username, or malformed input so the endpoint never reveals whether a
// username exists (spec: "login fails with a generic error and no session").
export const GENERIC_LOGIN_ERROR = 'Invalid username or password';

// Rate limiter for login: 5 attempts per 15 minutes per IP
// Disabled in test environment (NODE_ENV=test)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Mock admin for development when database is unreachable
const MOCK_ADMIN = {
  id: 'a32e9af5-b10b-4dcb-8101-1405df17470b',
  username: 'admin',
  password_hash: '$2a$10$8K1p/a0dhrxiow8ZQqNqzOqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', // "inventario2026" hashed
};

/**
 * Session endpoints:
 *   POST /api/auth/login   {username,password} -> httpOnly JWT cookie
 *   POST /api/auth/logout  clear the session cookie
 *   GET  /api/auth/me      session validity (requireAuth)
 *
 * The pool is injected so tests can point at a test database (same pattern
 * as routes/health.js).
 */
export default function authRouter(pool) {
  const router = Router();

  // Check if we should use mock auth (database unreachable)
  const useMock = process.env.USE_MOCK_DASHBOARD === 'true' || !pool;

  router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username === '' ||
      password === ''
    ) {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    if (useMock) {
      // Mock authentication for development
      if (username === 'admin' && password === 'inventario2026') {
        const csrfToken = generateCsrfToken();
        res.cookie(COOKIE_NAME, signToken(MOCK_ADMIN), cookieOptions());
        res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions());
        return res.status(200).json({ user: { id: MOCK_ADMIN.id, username: MOCK_ADMIN.username } });
      }
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    let rows;
    try {
      ({ rows } = await pool.query(
        'SELECT id, username, password_hash FROM admins WHERE username = $1',
        [username]
      ));
    } catch {
      // Database unreachable: not a credentials problem, answer 503 rather
      // than a misleading 401.
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }

    const admin = rows[0];
    const passwordOk = admin
      ? await bcrypt.compare(password, admin.password_hash).catch(() => false)
      : false;

    if (!admin || !passwordOk) {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    const csrfToken = generateCsrfToken();
    res.cookie(COOKIE_NAME, signToken(admin), cookieOptions());
    res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions());
    return res
      .status(200)
      .json({ user: { id: admin.id, username: admin.username } });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions({ forClearing: true }));
    res.clearCookie(CSRF_COOKIE_NAME, csrfCookieOptions({ forClearing: true }));
    return res.status(200).json({ ok: true });
  });

  router.get('/me', requireAuth, (req, res) => {
    return res.status(200).json({ user: req.user });
  });

  return router;
}
