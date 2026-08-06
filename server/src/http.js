// Shared response helpers so every route answers the same JSON error shape
// ({ error: string }) with the right status code. Keeps handlers free of
// inline res.status(...).json(...) noise.
export function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export function notFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

export function conflict(res, message) {
  return res.status(409).json({ error: message });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Route :id params must be UUIDs; passing garbage to pg raises
 * 22P02 (invalid_text_representation) and would 500. Rejecting the shape
 * early turns that into a plain 404.
 */
export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True for a strict YYYY-MM-DD calendar date. ISO parsing rejects
 * out-of-range days/months (e.g. 2026-02-30, 2026-13-01) as Invalid Date,
 * so the shape regex plus a parse check is sufficient.
 */
export function isDateString(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}
