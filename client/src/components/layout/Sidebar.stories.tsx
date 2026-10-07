import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/inventory', label: 'Inventario', icon: 'inventory' },
  { path: '/customers', label: 'Clientes', icon: 'users' },
  { path: '/suppliers', label: 'Proveedores', icon: 'archive' },
  { path: '/collections', label: 'Cobranzas', icon: 'archive' },
  { path: '/sales/cash', label: 'Ventas Efectivo', icon: 'credit-card' },
  { path: '/sales/credit', label: 'Ventas Crédito', icon: 'credit-card' },
  { path: '/apartados', label: 'Apartados', icon: 'archive' },
  { path: '/payments', label: 'Pagos', icon: 'credit-card' },
];

export const Default: Story = {
  args: {
    navItems,
    userName: 'Admin User',
    userRole: 'Administrador',
    onLogout: () => {},
  },
};

export const Collapsed: Story = {
  args: {
    ...Default.args,
    collapsed: true,
  },
};