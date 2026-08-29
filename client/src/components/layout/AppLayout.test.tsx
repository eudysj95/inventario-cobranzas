import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct CSS Grid structure', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      </BrowserRouter>
    );

    const layout = screen.getByTestId('app-layout');
    expect(layout).toHaveClass('app-layout');

    // Check grid areas exist
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
  });

  it('renders sidebar, header, and main in correct grid areas', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');
    const header = screen.getByTestId('header');
    const main = screen.getByTestId('main');

    expect(sidebar).toHaveClass('sidebar');
    expect(header).toHaveClass('header');
    expect(main).toHaveClass('main');
  });

  it('renders children in main area', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div data-testid="custom-content">Custom Content</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    const main = screen.getByTestId('main');
    expect(main).toContainHTML('<div data-testid="custom-content">Custom Content</div>');
  });

  it('renders sidebar content when provided', () => {
    render(
      <BrowserRouter>
        <AppLayout sidebar={<nav data-testid="sidebar-nav">Sidebar Nav</nav>}>
          <div>Main</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toContainHTML('<nav data-testid="sidebar-nav">Sidebar Nav</nav>');
  });

  it('renders header content when provided', () => {
    render(
      <BrowserRouter>
        <AppLayout header={<div data-testid="header-content">Header Content</div>}>
          <div>Main</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('header-content')).toBeInTheDocument();
    const header = screen.getByTestId('header');
    expect(header).toContainHTML('<div data-testid="header-content">Header Content</div>');
  });

  it('applies collapsed class to sidebar when provided', () => {
    render(
      <BrowserRouter>
        <AppLayout sidebarClassName="collapsed">
          <div>Main</div>
        </AppLayout>
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('collapsed');
  });

  it('has correct ARIA roles', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Main</div>
        </AppLayout>
      </BrowserRouter>
    );

    const sidebar = screen.getByTestId('sidebar');
    const header = screen.getByTestId('header');
    const main = screen.getByTestId('main');

    expect(sidebar).toHaveAttribute('role', 'complementary');
    expect(sidebar).toHaveAttribute('aria-label', 'Navegación principal');
    expect(header).toHaveAttribute('role', 'banner');
    expect(main).toHaveAttribute('role', 'main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('includes skip link target in main', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Main</div>
        </AppLayout>
      </BrowserRouter>
    );

    const main = screen.getByTestId('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });
});