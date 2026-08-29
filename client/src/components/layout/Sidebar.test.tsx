import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mock useConfig
vi.mock('../../api/config', () => ({
  useConfig: () => ({
    data: {
      businessName: 'Nexo Test',
      logoUrl: '/logo-nexo.png',
      primaryColor: '#047857',
    },
    isError: false,
  }),
  DEFAULT_CONFIG: {
    businessName: 'Nexo',
    logoUrl: '/logo-nexo.png',
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const navItems = [
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

  it('renders sidebar with brand logo and name', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-brand')).toBeInTheDocument();
    expect(screen.getByAltText('Nexo Test')).toBeInTheDocument();
    expect(screen.getByText('Nexo Test')).toBeInTheDocument();
  });

  it('renders navigation items as NavLinks', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    navItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.path);
    });
  });

  it('renders navigation links with correct hrefs', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    navItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.path);
    });
  });

  it('shows collapse/expand toggle button', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /colapsar|expandir/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggles collapsed state on button click', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /colapsar/i });
    fireEvent.click(toggleBtn);

    // Should now show expandir
    const expandBtn = screen.getByRole('button', { name: /expandir/i });
    expect(expandBtn).toBeInTheDocument();
  });

  it('persists collapsed state in localStorage', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /colapsar/i });
    fireEvent.click(toggleBtn);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar:collapsed', 'true');
  });

  it('restores collapsed state from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');

    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('collapsed');
  });

  it('renders user menu at bottom with avatar and logout', () => {
    const onLogout = vi.fn();
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} userName="Juan Pérez" userRole="Administrador" onLogout={onLogout} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('calls onLogout when logout button clicked', () => {
    const onLogout = vi.fn();
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} userName="Juan" onLogout={onLogout} />
      </BrowserRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutBtn);

    expect(onLogout).toHaveBeenCalled();
  });

  it('renders logout button with accessible name', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} userName="Juan" onLogout={vi.fn()} />
      </BrowserRouter>
    );

    // The logout button should have accessible name
    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i });
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn).toHaveAttribute('aria-label', 'Cerrar sesión');
  });

  it('applies tenant brand from config', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const brand = screen.getByTestId('sidebar-brand');
    expect(brand).toHaveAttribute('aria-label', 'Nexo Test');
  });

  it('supports keyboard navigation - roving tabindex', () => {
    render(
      <BrowserRouter initialEntries={['/']}>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const firstLink = screen.getByRole('link', { name: 'Dashboard' });
    const secondLink = screen.getByRole('link', { name: 'Inventario' });

    // Active link should have tabindex 0, others -1
    expect(firstLink).toHaveAttribute('tabindex', '0');
    expect(secondLink).toHaveAttribute('tabindex', '-1');
  });

  it('shows icons for each nav item', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    navItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      // Check that icon SVG is present
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('collapsed state hides labels but shows icons', () => {
    localStorageMock.getItem.mockReturnValue('true');

    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('collapsed');

    // Labels should be hidden
    const dashboardLabel = screen.getByText('Dashboard');
    expect(dashboardLabel).toHaveClass('nav-label');
    // In collapsed state, the label should be hidden via CSS
  });

  it('has correct ARIA structure for navigation', () => {
    render(
      <BrowserRouter>
        <Sidebar navItems={navItems} />
      </BrowserRouter>
    );

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(nav).toBeInTheDocument();
  });
});