// Session API + auth state hook (task 6.2). The server (server/src/routes/auth.js)
// manages the session as a JWT in an httpOnly cookie named 'token'; these helpers
// only need same-origin fetch (the browser sends the cookie automatically).
// No-detail-leakage contract (spec "Single shared admin login"): the client NEVER
// parses an error body from /api/auth/login — every non-2xx answer throws the SAME
// generic message, mirroring the server's GENERIC_LOGIN_ERROR intent exactly.

import { useQuery, useQueryClient } from '@tanstack/react-query';

// Neutral Spanish UI copy — deliberately generic, identical for every login
// failure so the endpoint can never be probed through the UI.
export const GENERIC_LOGIN_ERROR = 'Usuario o contraseña incorrectos.';

// Single shared query key: LoginPage and the route guard consume the same session
// state via useCurrentUser(); login/logout replace it in place (no reload).
export const AUTH_ME_KEY = ['auth', 'me'];

/** POST /api/auth/login. Throws GENERIC_LOGIN_ERROR on any non-2xx answer. */
export async function login({ username, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    // Deliberately no res.json() here — the body is never exposed.
    throw new Error(GENERIC_LOGIN_ERROR);
  }
  return res.json(); // { user: { id, username } }
}

/** POST /api/auth/logout — clears the session cookie server-side. */
export async function logout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error(`logout endpoint returned ${res.status}`);
  return true;
}

/**
 * GET /api/auth/me — session validity. 401 maps to null ("not signed in" is the
 * EXPECTED state, not an error) so the guard branches on data === null instead of
 * doing error triage; any other failure throws.
 */
export async function getMe() {
  const res = await fetch('/api/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`session endpoint returned ${res.status}`);
  const data = await res.json();
  return data.user ?? null;
}

/** Session state hook. retry: false — a 401 (null user) or a real error must
 * settle immediately; retrying would spam the session endpoint. */
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: getMe,
    retry: false,
  });
}

/** Login/logout actions that update the cached session in place so every
 * consumer of useCurrentUser() sees the new state without a reload. */
export function useAuthActions() {
  const queryClient = useQueryClient();
  return {
    async logIn(credentials) {
      const result = await login(credentials);
      queryClient.setQueryData(AUTH_ME_KEY, result.user ?? null);
      return result;
    },
    async logOut() {
      await logout();
      // Drop every cached server-state query from this session (future business
      // pages), then repin the auth key to null so the guard redirects
      // deterministically without a /me refetch.
      queryClient.clear();
      queryClient.setQueryData(AUTH_ME_KEY, null);
    },
  };
}