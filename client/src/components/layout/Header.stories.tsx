import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
    ],
    userName: 'Admin User',
    userRole: 'Administrador',
    onLogout: () => {},
    onMenuClick: () => {},
    onSidebarToggle: () => {},
    sidebarCollapsed: false,
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Inventario', path: '/inventory' },
      { label: 'Nuevo Producto', path: '/inventory/new' },
    ],
    userName: 'Admin User',
    userRole: 'Administrador',
    onLogout: () => {},
    onMenuClick: () => {},
    onSidebarToggle: () => {},
    sidebarCollapsed: false,
  },
};

export const Minimal: Story = {
  args: {
    breadcrumbs: [{ label: 'Login', path: '/login' }],
  },
};