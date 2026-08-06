import jwt from 'jsonwebtoken';

// Session cookie name. Single shared admin, stateless JWT in an httpOnly
// cookie (design decision: JWT over server-side sessions — no revocation,
// acceptable for a single shared admin).
export const COOKIE_NAME = 'token';

// 12h session lifetime per design.
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SESSION_TTL = '12h';

// Documented insecure fallback for local development only. Production fails
// fast at boot when JWT_SECRET is missing (see getJwtSecret).
const DEV_SECRET = 'inventario-dev-secret-change-me';

let jwtSecret = null;

/**
 * Resolve the JWT signing secret from JWT_SECRET. In production the env var
 * is required and its absence is a hard error; outside production a
 * documented dev-only fallback keeps local runs working without config.
 */
export function getJwtSecret() {
  if (jwtSecret) return jwtSecret;
  const env = process.env.JWT_SECRET;
  if (env) {
    jwtSecret = env;
    return jwtSecret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be set in production (see server/.env.example)'
    );
  }
  console.warn(
    '[auth] JWT_SECRET not set — using an insecure dev-only secret; ' +
      'set JWT_SECRET for any real deployment'
  );
  jwtSecret = DEV_SECRET;
  return jwtSecret;
}

/** Drop the cached secret so tests can swap JWT_SECRET between cases. */
export function resetJwtSecret() {
  jwtSecret = null;
}

/**
 * Minimal cookie parser for the single httpOnly session cookie. Express
 * exposes the raw Cookie header and values set via res.cookie() are
 * URL-encoded; a tiny parser avoids a cookie-parser dependency.
 */
export function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    try {
      value = decodeURIComponent(value);
    } catch {
      // keep the raw value when it is not valid percent-encoding
    }
    cookies[name] = value;
  }
  return cookies;
}

/** Sign a 12h session token for an admin row. */
export function signToken(admin) {
  return jwt.sign({ username: admin.username }, getJwtSecret(), {
    subject: String(admin.id),
    expiresIn: SESSION_TTL,
    algorithm: 'HS256',
  });
}

/**
 * Express middleware: require a valid session cookie. On success sets
 * req.user and calls next(); otherwise answers 401 with a generic body for
 * missing, invalid, or expired tokens (no detail leakage).
 */
export function requireAuth(req, res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Cookie attributes for the session cookie. forClearing drops maxAge so
 * res.clearCookie() emits only the epoch Expires (a Max-Age alongside an
 * epoch Expires would take precedence and fail to clear the cookie).
 */
export function cookieOptions({ forClearing = false } = {}) {
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  if (!forClearing) options.maxAge = SESSION_TTL_MS;
  return options;
}
