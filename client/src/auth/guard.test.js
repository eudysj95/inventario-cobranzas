// Unit tests for the route guard decision (task 6.2). Pure logic only — no
// component test tooling (6.1 precedent). Proves the auth scenarios:
// "Login required" (unauthenticated -> blocked) and "Session handling"
// (invalid/expired session -> blocked). The guard never drops to an
// unprotected area, including on session-check failure.
import { describe, expect, it } from 'vitest';
import { resolveAuthView } from './guard';

describe('resolveAuthView (route guard decision)', () => {
  it('renders nothing while the session query is still pending', () => {
    expect(resolveAuthView({ status: 'pending', user: null })).toEqual({
      kind: 'loading',
    });
    expect(
      resolveAuthView({ status: 'pending', user: { id: 'u1' } })
    ).toEqual({ kind: 'loading' });
  });

  it('allows an authenticated user into the protected area', () => {
    expect(
      resolveAuthView({ status: 'success', user: { id: 'u1', username: 'admin' } })
    ).toEqual({ kind: 'allow' });
  });

  it('redirects an unauthenticated user to /login (spec: Login required)', () => {
    expect(resolveAuthView({ status: 'success', user: null })).toEqual({
      kind: 'redirect',
      to: '/login',
    });
  });

  it('redirects on session-check failure instead of opening the guard (fail closed)', () => {
    // Network/server error on /api/auth/me: data is absent, access stays
    // blocked — never an unprotected fallback.
    expect(resolveAuthView({ status: 'error', user: null })).toEqual({
      kind: 'redirect',
      to: '/login',
    });
  });
});