// Application shell + routes (tasks 6.2 + 6.3).
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
// check via GET /api/auth/me). The protected area is an app shell (header +
// nav + logout) whose pages are added by slices 6.3-6.5; /inventory is the
// current page (task 6.3), the index and catch-all redirect to it. UI copy in
// neutral Spanish (design: "UI labels in neutral Spanish").

import { useEffect } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from './api/config.js';
import { useAuthActions } from './api/auth.js';
import RequireAuth from './auth/RequireAuth.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import InventoryPage from './features/inventory/InventoryPage.jsx';
import ApartadosPage from './features/apartados/ApartadosPage.jsx';
import CreditSalesPage from './features/credit/CreditSalesPage.jsx';
import PaymentsPanel from './features/credit/PaymentsPanel.jsx';

function AppShell() {
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
          <p role="alert">No se pudo cargar la configuración del negocio; se muestran valores por defecto.</p>
        )}
        <nav>
          <NavLink to="/inventory">Inventario</NavLink>
          <NavLink to="/apartados">Apartados</NavLink>
          <NavLink to="/credit-sales">Venta a crédito</NavLink>
          <NavLink to="/payments">Cobros</NavLink>
        </nav>
        {whatsappHref && (
          <a href={whatsappHref} title="Contacto por WhatsApp">
            {config.whatsappNumber}
          </a>
        )}
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>
      <Outlet />
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
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/inventory" replace />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="apartados" element={<ApartadosPage />} />
          <Route path="credit-sales" element={<CreditSalesPage />} />
          <Route path="payments" element={<PaymentsPanel />} />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
