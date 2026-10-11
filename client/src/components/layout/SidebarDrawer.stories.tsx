import type { Meta, StoryObj } from '@storybook/react';
import SidebarDrawer from './SidebarDrawer';

const meta: Meta<typeof SidebarDrawer> = {
  title: 'Layout/SidebarDrawer',
  component: SidebarDrawer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/inventory', label: 'Inventario', icon: 'inventory' },
  { path: '/customers', label: 'Clientes', icon: 'users' },
];

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    navItems,
    userName: 'Admin User',
    userRole: 'Administrador',
    onLogout: () => {},
  },
};

export const Closed: Story = {
  args: {
    ...Default.args,
    isOpen: false,
  },
};