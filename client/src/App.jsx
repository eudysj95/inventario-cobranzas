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

import { useEffect, Component } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from './api/config.js';
import { useAuthActions } from './api/auth.js';
import RequireAuth from './auth/RequireAuth.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import InventoryPage from './features/inventory/InventoryPage.jsx';
import ApartadosPage from './features/apartados/ApartadosPage.jsx';
import CreditSalesPage from './features/credit/CreditSalesPage.jsx';
import CashSalesPage from './features/credit/CashSalesPage.jsx';
import PaymentsPanel from './features/credit/PaymentsPanel.jsx';
import CollectionsPage from './features/collections/CollectionsPage.jsx';
import SuppliersPage from './features/suppliers/SuppliersPage.jsx';
import CustomersPage from './features/customers/CustomersPage.jsx';

// Error Boundary para capturar errores de render y mostrarlos (debug producción)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>Error de la aplicación</h2>
          <p><strong>Error:</strong> {this.state.error?.message || this.state.error}</p>
          <p><strong>Stack:</strong></p>
          <pre>{this.state.errorInfo?.componentStack || 'No stack available'}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Debug component to verify React is rendering
function DebugRoot() {
  console.log('DebugRoot rendering...');
  // Force visible output
  if (typeof window !== 'undefined') {
    document.body.style.background = '#e8f5e9';
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'position:fixed;top:10px;left:10px;z-index:9999;padding:20px;background:green;color:white;font-size:20px;border:3px solid white;';
    debugDiv.textContent = '✅ DebugRoot: React está renderizando en el navegador';
    document.body.appendChild(debugDiv);
  }
  return (
    <div style={{ padding: '20px', border: '2px solid green', background: '#e8f5e9', minHeight: '100px' }}>
      <h2>✅ React está renderizando correctamente</h2>
      <p>Si ves esto, React funciona. El problema está en los componentes hijos.</p>
    </div>
  );
}

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
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/apartados">Apartados</NavLink>
          <NavLink to="/credit-sales">Venta a crédito</NavLink>
          <NavLink to="/venta">Venta</NavLink>
          <NavLink to="/cobros">Cobranzas</NavLink>
          <NavLink to="/payments">Pagos</NavLink>
          <NavLink to="/proveedores">Proveedores</NavLink>
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

  console.log('App rendering with config:', config);

  return (
    <ErrorBoundary>
      <DebugRoot />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/inventory" replace />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="apartados" element={<ApartadosPage />} />
            <Route path="credit-sales" element={<CreditSalesPage />} />
            <Route path="venta" element={<CashSalesPage />} />
            <Route path="cobros" element={<CollectionsPage />} />
            <Route path="payments" element={<PaymentsPanel />} />
            <Route path="proveedores" element={<SuppliersPage />} />
            <Route path="*" element={<Navigate to="/inventory" replace />} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
