// Application shell + routes (task 6.2).
//
// Branding is config-driven: businessName, currency and the instance WhatsApp
// number come from GET /api/config (public endpoint, client/src/api/config.js)
// — never hardcoded. While the boot fetch is pending or failed, neutral
// defaults render (LOW-risk fallback per design) and a fetch failure is
// surfaced as a warning banner ("fail visible").
//
// The instance WhatsApp number below is display/contact ONLY. Customer wa.me
// collection links (slice 6.5) MUST use the customer's phone from the record,
// never this number.
//
// Routing: /login is public; everything else sits behind RequireAuth (session
// check via GET /api/auth/me). The protected area is a placeholder home that
// slices 6.3-6.5 will replace with the real pages.

import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from './api/config.js';
import { useAuthActions } from './api/auth.js';
import RequireAuth from './auth/RequireAuth.jsx';
import LoginPage from './features/auth/LoginPage.jsx';

// Protected placeholder home (filled by 6.3-6.5: inventory, apartados,
// credit, collections, suppliers). Hosts the app shell header + logout.
function Home() {
  const { data, isError } = useConfig();
  const config = data ?? DEFAULT_CONFIG;
  const { logOut } = useAuthActions();
  const navigate = useNavigate();

  async function handleLogout() {
    await logOut();
    navigate('/login', { replace: true });
  }

  // Display/contact link to the instance WhatsApp number (digits only for
  // wa.me). Never feeds customer collection links.
  const whatsappHref = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`
    : null;

  return (
    <div>
      <header>
        <h1>{config.businessName}</h1>
        {isError && (
          <p role="alert">
            No se pudo cargar la configuración del negocio; se muestran valores por defecto.
          </p>
        )}
      </header>
      <p>Sistema de inventario y cobranzas</p>
      {whatsappHref && (
        <p>
          <a href={whatsappHref} title="Contactar por WhatsApp">
            {config.whatsappNumber}
          </a>
        </p>
      )}
      <p>Panel principal — las secciones se agregan en las próximas versiones.</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default function App() {
  const { data } = useConfig();
  const config = data ?? DEFAULT_CONFIG;

  useEffect(() => {
    document.title = config.businessName;
  }, [config.businessName]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
