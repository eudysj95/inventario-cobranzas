// Shared fetch wrapper (task 6.1 "api/ wrapper"). Every business API module
// routes requests through apiRequest so cookie auth (the browser sends the
// httpOnly session cookie automatically — same origin), JSON serialization,
// and error normalization live in ONE place. auth.js and config.js predate
// this module and keep their bespoke behaviors; products.js and later modules
// use it.
//
// Error contract: the server answers non-2xx with { error: "message" }
// (server/src/http.js). The message is surfaced VERBATIM to the UI (it is the
// last line of defense for 400/409 guard messages such as "Cannot delete a
// product with stock remaining") and the HTTP status is attached so callers
// can branch when needed. Non-JSON failures degrade to a generic message.
//
// CSRF protection: for mutating requests (POST, PATCH, DELETE), the client
// reads the csrf_token cookie (set by login) and sends it in the
// X-CSRF-Token header (double-submit cookie pattern).

export class ApiError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Perform a same-origin JSON request against the API.
 * @param {string} path  absolute API path, e.g. '/api/products'
 * @param {{method?: string, body?: object, signal?: AbortSignal}} [options]
 * @returns {Promise<object|null>} parsed JSON body, or null on 204
 * @throws {ApiError} on any non-2xx response
 */
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const headers = body !== undefined ? { 'Content-Type': 'application/json' } : {};
  
  // Add CSRF token for mutating requests
  const mutatingMethods = ['POST', 'PATCH', 'DELETE', 'PUT'];
  if (mutatingMethods.includes(method.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string' && data.error !== '') {
        message = data.error;
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(message, { status: res.status });
  }

  if (res.status === 204) return null;
  return res.json();
}
