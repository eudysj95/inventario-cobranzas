// Route guard (task 6.2): layout route that shields the protected area.
//
// Renders nothing while the session query settles (no flash of a redirect),
// sends unauthenticated visitors to /login, and renders the nested route
// (Outlet) once a user is confirmed. The decision logic lives in guard.js so
// it is unit-testable without component tooling.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../api/auth.js';
import { resolveAuthView } from './guard.js';

export default function RequireAuth() {
  const { status, data: user } = useCurrentUser();
  const location = useLocation();
  const view = resolveAuthView({ status, user });

  if (view.kind === 'loading') return null;
  if (view.kind === 'redirect') {
    // Remember where the visitor was headed so login can continue there.
    return (
      <Navigate to={view.to} replace state={{ from: location.pathname }} />
    );
  }
  return <Outlet />;
}