// Application shell + routes — Nexo design system.
// Branding from /api/config (tenant-aware). Protected routes behind RequireAuth.
// Feature flag VITE_NEW_LAYOUT controls new layout (sidebar + header + breadcrumbs).
// Feature flag VITE_NEW_LOGIN=true enables new login page (default: false)

import { useEffect, useState, Suspense, lazy } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from './api/config.js';
import { useAuthActions } from './api/auth.js';
import RequireAuth from './auth/RequireAuth.jsx';
import LoginPage from './features/auth/LoginPage.tsx'; // New login page (TypeScript)
import LoginPageLegacy from './features/auth/LoginPage.old.jsx'; // Old login page (fallback)
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import SidebarDrawer from './components/layout/SidebarDrawer.jsx';
import Breadcrumbs from './components/layout/Breadcrumbs.jsx';
import './styles/design-tokens.css';
import './styles/utilities.css';

// Feature flag: VITE_NEW_LAYOUT=true enables new layout (default: false)
const USE_NEW_LAYOUT = import.meta.env.VITE_NEW_LAYOUT === 'true';
// Feature flag: VITE_NEW_LOGIN=true enables new login page (default: false)
const USE_NEW_LOGIN = import.meta.env.VITE_NEW_LOGIN === 'true';

// Lazy-load the new login page to avoid bundle bloat when feature flag is off
const NewLoginPage = lazy(() => import('./features/auth/LoginPage.tsx'));

// Lazy-load CRUD pages for code splitting
const InventoryList = lazy(() => import('./features/inventory/InventoryList.tsx'));
const InventoryForm = lazy(() => import('./features/inventory/InventoryForm.tsx'));
const CustomersList = lazy(() => import('./features/customers/CustomersList.tsx'));
const CustomerForm = lazy(() => import('./features/customers/CustomerForm.tsx'));
const SuppliersList = lazy(() => import('./features/suppliers/SuppliersList.tsx'));
const CashSaleForm = lazy(() => import('./features/credit/CashSaleFormNew.tsx'));
const CreditSaleForm = lazy(() => import('./features/credit/CreditSaleFormNew.tsx'));
const ApartadoForm = lazy(() => import('./features/apartados/ApartadoFormNew.tsx'));
const CollectionsList = lazy(() => import('./features/collections/CollectionsList.tsx'));
const PaymentForm = lazy(() => import('./features/credit/PaymentFormNew.tsx'));

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/inventory', label: 'Inventario', icon: 'inventory' },
  { path: '/clientes', label: 'Clientes', icon: 'users' },
  { path: '/apartados', label: 'Apartados', icon: 'archive' },
  { path: '/credit-sales', label: 'Venta a crédito', icon: 'credit-card' },
  { path: '/venta', label: 'Venta', icon: 'shopping-cart' },
  { path: '/cobros', label: 'Cobranzas', icon: 'dollar-sign' },
  { path: '/proveedores', label: 'Proveedores', icon: 'truck' },
  { path: '/payments', label: 'Pagos', icon: 'banknote' },
];

function AppShell() {
  const { data, isError } = useConfig();
  const config = data ?? DEFAULT_CONFIG;
  const { logOut } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function handleLogout() {
    await logOut();
    navigate('/login', { replace: true });
  }

  const whatsappHref = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`
    : null;

  // Close drawer on route change (mobile)
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Inject tenant CSS vars into :root for runtime theming
  useEffect(() => {
    if (data) {
      const root = document.documentElement;
      if (data.primaryColor) root.style.setProperty('--tenant-primary', data.primaryColor);
      if (data.primaryColorHover) root.style.setProperty('--tenant-primary-hover', data.primaryColorHover);
      if (data.primaryColorLight) root.style.setProperty('--tenant-primary-light', data.primaryColorLight);
      if (data.bgColor) root.style.setProperty('--tenant-bg', data.bgColor);
      if (data.surfaceColor) root.style.setProperty('--tenant-surface', data.surfaceColor);
      if (data.fontFamily) root.style.setProperty('--tenant-font', data.fontFamily);
      root.style.setProperty('--tenant-name', `"${config.businessName}"`);
      if (data.logoUrl) root.style.setProperty('--tenant-logo', `url("${data.logoUrl}")`);
    }
  }, [data, config.businessName]);

  // Build breadcrumbs from route hierarchy
  const breadcrumbs = [
    { label: 'Inicio', path: '/' },
    ...NAV_ITEMS.filter(item => location.pathname.startsWith(item.path) && item.path !== '/')
      .map(item => ({ label: item.label, path: item.path })),
  ];

  // For new layout, use AppLayout + Sidebar + Header + SidebarDrawer
  if (USE_NEW_LAYOUT) {
    return (
      <AppLayout
        sidebar={
          <Sidebar
            navItems={NAV_ITEMS}
            userName={config.businessName}
            userRole="Administrador"
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        }
        header={
          <Header
            breadcrumbs={breadcrumbs}
            userName={config.businessName}
            userRole="Administrador"
            onLogout={handleLogout}
            onMenuClick={() => setNavOpen(true)}
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
        }
      >
        {isError && (
          <div className="alert alert-warning container" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>No se pudo cargar la configuración del negocio; se muestran valores por defecto.</span>
          </div>
        )}
        <div className="container">
          <Outlet />
        </div>
      </AppLayout>
    );
  }

  // Old layout (existing AppShell)
  return (
    <div className="app-shell" data-testid="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="app-header" role="banner">
        <div className="header-inner">
          <div className="header-left">
            <button
              type="button"
              className="btn btn-ghost header-menu-btn hide-desktop"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={navOpen}
              aria-controls="nav-drawer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="header-brand" aria-label={config.businessName}>
              <img
                src="/logo-nexo.png"
                alt=""
                className="header-logo"
                width="40"
                height="40"
                aria-hidden="true"
              />
              <span className="header-brand-name">{config.businessName}</span>
            </div>
          </div>

          <nav id="main-nav" className="header-nav hide-mobile" role="navigation" aria-label="Navegación principal">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                    aria-current={({ isActive }) => isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-right">
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="header-whatsapp" title="Contacto por WhatsApp" aria-label="Contacto por WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          )}
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm" aria-label="Cerrar sesión">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="hide-mobile">Cerrar sesión</span>
          </button>
        </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {navOpen && (
        <div className="modal-backdrop hide-desktop" role="dialog" aria-modal="true" aria-labelledby="drawer-title" id="nav-drawer">
          <div className="modal drawer" style={{ maxWidth: '100%', maxHeight: '100vh', borderRadius: 0, padding: 0 }}>
            <div className="modal-header drawer-header">
              <h2 id="drawer-title" className="modal-title">Navegación</h2>
              <button type="button" className="modal-close" onClick={() => setNavOpen(false)} aria-label="Cerrar menú">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body drawer-body">
              <nav role="navigation" aria-label="Navegación principal móvil">
                <ul className="nav-list drawer-nav-list">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `nav-link drawer-nav-link ${isActive ? 'nav-link-active' : ''}`}
                        aria-current={({ isActive }) => isActive ? 'page' : undefined}
                        onClick={() => setNavOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="app-main" role="main">
        {isError && (
          <div className="alert alert-warning container" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>No se pudo cargar la configuración del negocio; se muestran valores por defecto.</span>
          </div>
        )}
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { data } = useConfig();
  const config = data ?? DEFAULT_CONFIG;

  useEffect(() => {
    document.title = config.businessName;
  }, [config.businessName]);

  // Choose login page based on feature flag
  const LoginPageComponent = USE_NEW_LOGIN ? (
    <Suspense fallback={<div className="login-page"><div className="spinner" /></div>}>
      <NewLoginPage />
    </Suspense>
  ) : (
    <LoginPageLegacy />
  );

  return (
    <Routes>
      <Route path="/login" element={LoginPageComponent} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          
          {/* Inventory CRUD */}
          <Route path="inventory" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><InventoryList /></Suspense>} />
          <Route path="inventory/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><InventoryForm mode="new" /></Suspense>} />
          <Route path="inventory/:id/edit" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><InventoryForm mode="edit" /></Suspense>} />
          
          {/* Customers CRUD */}
          <Route path="clientes" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CustomersList /></Suspense>} />
          <Route path="clientes/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CustomerForm mode="new" /></Suspense>} />
          <Route path="clientes/:id/edit" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CustomerForm mode="edit" /></Suspense>} />
          
          {/* Suppliers CRUD (debt-based) */}
          <Route path="proveedores" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><SuppliersList /></Suspense>} />
          
          {/* Sales */}
          <Route path="venta/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CashSaleForm /></Suspense>} />
          <Route path="credit-sales/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CreditSaleForm /></Suspense>} />
          
          {/* Apartados */}
          <Route path="apartados/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><ApartadoForm /></Suspense>} />
          
          {/* Collections with WhatsAppHub inline */}
          <Route path="cobros" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><CollectionsList /></Suspense>} />
          
          {/* Payments */}
          <Route path="payments/new" element={<Suspense fallback={<div className="loading"><div className="spinner" /> Cargando…</div>}><PaymentForm /></Suspense>} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="apartados" element={<Navigate to="/apartados/new" replace />} />
          <Route path="credit-sales" element={<Navigate to="/credit-sales/new" replace />} />
          <Route path="venta" element={<Navigate to="/venta/new" replace />} />
          <Route path="payments" element={<Navigate to="/payments/new" replace />} />
          
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}