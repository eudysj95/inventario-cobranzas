// Login page — Nexo design system.
// Branding from /api/config (tenant-aware). Generic error per spec.
// Already-authenticated users redirected to home.

import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import {
  GENERIC_LOGIN_ERROR,
  useAuthActions,
  useCurrentUser,
} from '../../api/auth.js';
import '../../styles/design-tokens.css';
import '../../styles/utilities.css';

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

  // Already authenticated → home
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
    <div className="login-page">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <main id="main-content" className="login-main" role="main">
        <div className="login-card card">
          <div className="login-header">
            <div className="login-brand" aria-label={config.businessName}>
              <img
                src="/logo-nexo.png"
                alt=""
                className="login-logo"
                width="48"
                height="48"
                aria-hidden="true"
              />
              <span className="login-brand-name">{config.businessName}</span>
            </div>
          </div>

          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Ingresá tus credenciales para acceder al sistema</p>

          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-row">
              <label htmlFor="username" className="label">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                disabled={submitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="admin"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="form-row">
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="btn btn-primary btn-lg w-full"
            >
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <p className="login-footer">Sistema de inventario y cobranzas</p>
        </div>
      </main>
    </div>
  );
}