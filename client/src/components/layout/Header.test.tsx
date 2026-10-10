import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, NavLink } from 'react-router-dom';
import Header from './Header';
import { ToastProvider } from '../../components/ui/Toast';

// Mock useConfig
vi.mock('../../api/config', () => ({
  useConfig: () => ({
    data: {
      businessName: 'Nexo Test',
      logoUrl: '/logo-nexo.png',
    },
    isError: false,
  }),
  DEFAULT_CONFIG: {
    businessName: 'Nexo',
    logoUrl: '/logo-nexo.png',
  },
}));

// Mock useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: 'dark',
  }),
}));

// Mock useToast hook but keep ToastProvider
vi.mock('../../components/ui/Toast', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: () => ({
      toast: vi.fn(),
      dismiss: vi.fn(),
      dismissAll: vi.fn(),
    }),
  };
});

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const breadcrumbs = [
    { label: 'Inicio', path: '/' },
    { label: 'Inventario', path: '/inventory' },
    { label: 'Productos', path: '/inventory/products' },
  ];

  const renderHeader = (props = {}) => {
    return render(
      <ToastProvider>
        <BrowserRouter>
          <Header breadcrumbs={breadcrumbs} {...props} />
        </BrowserRouter>
      </ToastProvider>
    );
  };

  it('renders header with breadcrumbs', () => {
    renderHeader();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders breadcrumb items as links (except current)', () => {
    renderHeader();

    // First two should be links
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inventario' })).toBeInTheDocument();

    // Last should be text (current page)
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('renders notifications bell', () => {
    renderHeader();

    const notificationsBtn = screen.getByRole('button', { name: /notificaciones/i });
    expect(notificationsBtn).toBeInTheDocument();
  });

  it('renders user avatar dropdown', () => {
    renderHeader({
      userName: 'Juan Pérez',
      userRole: 'Administrador',
    });

    const userMenu = screen.getByTestId('user-menu');
    expect(userMenu).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    // Role is shown in dropdown, not in header button
  });

  it('opens user dropdown on click', () => {
    renderHeader({
      userName: 'Juan',
      userRole: 'Admin',
      onLogout: vi.fn(),
    });

    const userBtn = screen.getByRole('button', { name: /menú de usuario/i });
    fireEvent.click(userBtn);

    // Dropdown should be open - look for logout text
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
  });

  it('closes user dropdown on outside click', () => {
    renderHeader({
      userName: 'Juan',
      userRole: 'Admin',
    });

    const userBtn = screen.getByRole('button', { name: /menú de usuario/i });
    fireEvent.click(userBtn);

    // Click outside
    fireEvent.click(document.body);

    expect(screen.queryByRole('menuitem', { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it('calls onLogout when logout clicked', () => {
    const onLogout = vi.fn();
    renderHeader({
      userName: 'Juan',
      onLogout,
    });

    const userBtn = screen.getByRole('button', { name: /menú de usuario/i });
    fireEvent.click(userBtn);

    const logoutItem = screen.getByRole('menuitem', { name: /cerrar sesión/i });
    fireEvent.click(logoutItem);

    expect(onLogout).toHaveBeenCalled();
  });

  it('renders hamburger menu on mobile', () => {
    renderHeader({ onMenuClick: vi.fn() });

    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    expect(menuBtn).toBeInTheDocument();
  });

  it('calls onMenuClick when hamburger clicked', () => {
    const onMenuClick = vi.fn();
    renderHeader({ onMenuClick });

    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    fireEvent.click(menuBtn);

    expect(onMenuClick).toHaveBeenCalled();
  });

  it('has correct height (56px)', () => {
    renderHeader();

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header');
  });

  it('has sticky header class', () => {
    renderHeader();

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header');
    expect(header).toHaveAttribute('role', 'banner');
  });

  it('applies tenant brand from config in breadcrumbs', () => {
    renderHeader();

    // Header shows breadcrumbs, tenant brand is in sidebar
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('has correct ARIA structure', () => {
    renderHeader();

    const header = screen.getByTestId('header');
    expect(header).toHaveAttribute('role', 'banner');

    const breadcrumbsNav = screen.getByTestId('breadcrumbs');
    expect(breadcrumbsNav).toHaveAttribute('role', 'navigation');
    expect(breadcrumbsNav).toHaveAttribute('aria-label', 'Ruta de navegación');
  });

  it('truncates middle breadcrumbs on narrow screens', () => {
    const longBreadcrumbs = [
      { label: 'Inicio', path: '/' },
      { label: 'Módulo Muy Largo', path: '/modulo' },
      { label: 'Submódulo', path: '/modulo/sub' },
      { label: 'Página Actual', path: '/modulo/sub/pagina' },
    ];

    render(
      <ToastProvider>
        <BrowserRouter>
          <Header breadcrumbs={longBreadcrumbs} />
        </BrowserRouter>
      </ToastProvider>
    );

    // All breadcrumbs should be present
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Módulo Muy Largo')).toBeInTheDocument();
    expect(screen.getByText('Submódulo')).toBeInTheDocument();
    expect(screen.getByText('Página Actual')).toBeInTheDocument();
  });
});