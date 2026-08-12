// Login page (task 6.2): single shared admin (no roles). Branding comes from
// config businessName (never hardcoded — amended task text). The failure
// message is GENERIC (spec: "login fails with a generic error") — server and
// client both refuse to leak which credential was wrong. An already-authenticated
// visitor is redirected home.

import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import {
  GENERIC_LOGIN_ERROR,
  useAuthActions,
  useCurrentUser,
} from '../../api/auth.js';

export default function LoginPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { status, data: user } = useCurrentUser();
  const { logIn } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated (e.g. opened /login with a live session): home.
  if (status === 'success' && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await logIn({ username, password });
      const from = location.state?.from ?? '/';
      navigate(from, { replace: true });
    } catch {
      setError(GENERIC_LOGIN_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <header>
        <h1>{config.businessName}</h1>
      </header>
      <h2>Iniciar sesión</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={submitting}
          />
        </div>
        <button type="submit" disabled={submitting || !username || !password}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p>Sistema de inventario y cobranzas</p>
    </div>
  );
}