// Pure decision logic for the authenticated route guard (task 6.2). Maps the
// session query state ({ status, user } from useCurrentUser) to the render
// decision. No React/router imports so vitest covers it without component
// tooling (6.1 precedent: unit-test the pure logic).

/**
 * @param {{ status: 'pending'|'success'|'error', user: {id:string}|null }} session
 * @returns {{kind:'loading'}} | {{kind:'allow'}} | {{kind:'redirect', to:string}}
 */
export function resolveAuthView({ status, user }) {
  if (status === 'pending') return { kind: 'loading' };
  if (user) return { kind: 'allow' };
  // Unauthenticated (401 -> null) AND failed session checks (network/server
  // error) both block access — the guard never drops to an unprotected area.
  return { kind: 'redirect', to: '/login' };
}