import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config';
import {
  GENERIC_LOGIN_ERROR,
  useAuthActions,
  useCurrentUser,
} from '../../api/auth';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Spinner } from '../../components/ui/Spinner';
import { WhatsAppHub } from '../../components/whatsapp/WhatsAppHub';
import { useToast } from '../../components/ui/Toast';
import '../../styles/design-tokens.css';
import '../../styles/utilities.css';

export default function LoginPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { status, data: user } = useCurrentUser();
  const { logIn } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated → home
  if (status === 'success' && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await logIn({ username, password });
      const from = location.state?.from ?? '/';
      navigate(from, { replace: true });
    } catch {
      setError(GENERIC_LOGIN_ERROR);
      toast({
        variant: 'error',
        title: 'Error de autenticación',
        description: GENERIC_LOGIN_ERROR,
      });
      // Focus username field on error
      document.getElementById('username')?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  const businessName = config.businessName ?? DEFAULT_CONFIG.businessName;
  const logoUrl = config.logoUrl ?? '/logo-nexo.png';
  const whatsappNumber = config.whatsappNumber;

  return (
    <div className="login-page">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <main id="main-content" className="login-main" role="main">
        <Card
          data-testid="login-card"
          className="w-full max-w-[380px] mx-auto"
          role="region"
          aria-label="Formulario de inicio de sesión"
        >
          <CardHeader className="text-center pb-4">
            <div className="login-brand flex flex-col items-center justify-center gap-2" aria-label={businessName}>
              <img
                src={logoUrl}
                alt={businessName}
                className="login-logo"
                width="14"
                height="14"
                aria-hidden="true"
              />
              <span className="login-brand-name text-lg font-semibold">{businessName}</span>
            </div>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="login-title text-2xl font-semibold">Iniciar sesión</h1>
              <p className="login-subtitle text-sm text-text-secondary">
                Ingresá tus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div
                className="alert alert-error"
                role="alert"
                aria-live="assertive"
                id="login-error"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form space-y-4" noValidate>
              <FormField
                label="Usuario"
                required
                error={error ? GENERIC_LOGIN_ERROR : undefined}
              >
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  disabled={submitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </FormField>

              <FormField
                label="Contraseña"
                required
                error={error ? GENERIC_LOGIN_ERROR : undefined}
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={submitting || !username || !password}
                loading={submitting}
              >
                Ingresar
              </Button>
            </form>

            {whatsappNumber && (
              <div className="text-center pt-2">
                <WhatsAppHub
                  phone={whatsappNumber}
                  variant="inline"
                  data-testid="whatsapp-inline"
                  aria-label="¿Necesitas ayuda? Contactar por WhatsApp"
                />
                <span className="sr-only">¿Necesitas ayuda? Contactar por WhatsApp</span>
              </div>
            )}

            <p className="login-footer text-center text-xs text-text-muted">
              Sistema de inventario y cobranzas
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}