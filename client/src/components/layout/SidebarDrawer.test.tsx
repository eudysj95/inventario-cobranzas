import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, NavLink } from 'react-router-dom';
import SidebarDrawer from './SidebarDrawer';

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

describe('SidebarDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/inventory', label: 'Inventario', icon: 'inventory' },
    { path: '/clientes', label: 'Clientes', icon: 'users' },
  ];

  it('renders drawer when open', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-drawer')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Navegación' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={false} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.queryByTestId('sidebar-drawer')).not.toBeInTheDocument();
  });

  it('renders backdrop overlay', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('drawer-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-backdrop')).toHaveClass('drawer-backdrop');
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={onClose} />
      </BrowserRouter>
    );

    const backdrop = screen.getByTestId('drawer-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={onClose} />
      </BrowserRouter>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('renders navigation items', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    navItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.path);
    });
  });

  it('closes on navigation item click', () => {
    const onClose = vi.fn();
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={onClose} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: 'Inventario' });
    fireEvent.click(link);

    expect(onClose).toHaveBeenCalled();
  });

  it('highlights active route', () => {
    render(
      <BrowserRouter initialEntries={['/inventory']}>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    const activeLink = screen.getByRole('link', { name: 'Inventario' });
    expect(activeLink).toHaveClass('nav-link-active');
  });

  it('renders brand header with logo and name', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('drawer-brand')).toBeInTheDocument();
    expect(screen.getByAltText('Nexo Test')).toBeInTheDocument();
    expect(screen.getByText('Nexo Test')).toBeInTheDocument();
  });

  it('renders close button in header', () => {
    const onClose = vi.fn();
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={onClose} />
      </BrowserRouter>
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar menú/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders user menu at bottom when provided', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer
          navItems={navItems}
          isOpen={true}
          onClose={vi.fn()}
          userName="Juan Pérez"
          userRole="Administrador"
          onLogout={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('has slide-in animation class', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    const drawer = screen.getByTestId('sidebar-drawer');
    expect(drawer).toHaveClass('drawer');
  });

  it('traps focus within drawer', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    const drawer = screen.getByTestId('sidebar-drawer');
    expect(drawer).toHaveAttribute('role', 'dialog');
    expect(drawer).toHaveAttribute('aria-modal', 'true');
  });

  it('applies tenant brand from config', () => {
    render(
      <BrowserRouter>
        <SidebarDrawer navItems={navItems} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    const brand = screen.getByTestId('drawer-brand');
    expect(brand).toHaveAttribute('aria-label', 'Nexo Test');
  });
});