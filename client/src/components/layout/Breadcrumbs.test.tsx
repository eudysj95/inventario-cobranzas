import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, NavLink } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

// Helper to render Breadcrumbs with a specific pathname
function renderWithPath(pathname: string, props = {}) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Breadcrumbs {...props} />
    </MemoryRouter>
  );
}

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders breadcrumbs component', () => {
    renderWithPath('/');
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('generates breadcrumbs for root path', () => {
    renderWithPath('/');

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Inventario')).not.toBeInTheDocument();
  });

  it('generates breadcrumbs for nested path', () => {
    renderWithPath('/inventory/products');

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Inventario' })).toHaveAttribute('href', '/inventory');
    // formatLabel converts 'products' to 'Products' (no Spanish mapping for /inventory/products)
    expect(screen.getByText('Products')).toHaveAttribute('aria-current', 'page');
  });

  it('last breadcrumb is current page (not clickable)', () => {
    renderWithPath('/inventory');

    const lastCrumb = screen.getByText('Inventario');
    expect(lastCrumb).not.toHaveAttribute('href');
    expect(lastCrumb).toHaveAttribute('aria-current', 'page');
  });

  it('renders separators between breadcrumbs', () => {
    renderWithPath('/inventory/products');

    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  it('uses custom label map for route labels', () => {
    const customLabels = {
      '/': 'Home',
      '/inventory': 'Stock',
      '/inventory/products': 'Items',
    };

    renderWithPath('/inventory/products', { labelMap: customLabels });

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stock' })).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('truncates middle breadcrumbs when maxItems exceeded', () => {
    renderWithPath('/a/b/c/d/e', { maxItems: 3 });

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    // Should show ellipsis
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('has correct ARIA structure', () => {
    renderWithPath('/inventory');

    const nav = screen.getByTestId('breadcrumbs');
    expect(nav).toHaveAttribute('role', 'navigation');
    expect(nav).toHaveAttribute('aria-label', 'Ruta de navegación');
  });

  it('handles dynamic routes with params', () => {
    renderWithPath('/inventory/products/123');

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inventario' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByText('123')).toHaveAttribute('aria-current', 'page');
  });

  it('renders home icon for root when showHomeIcon', () => {
    renderWithPath('/inventory', { showHomeIcon: true });

    const homeLink = screen.getByRole('link', { name: 'Inicio' });
    expect(homeLink.querySelector('svg')).toBeInTheDocument();
  });
});