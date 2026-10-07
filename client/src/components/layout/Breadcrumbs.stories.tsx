import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumbs from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Layout/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Inventario', path: '/inventory' },
      { label: 'Nuevo Producto', path: '/inventory/new' },
    ],
  },
};

export const HomeOnly: Story = { args: { items: [{ label: 'Home', path: '/' }] } };
export const Deep: Story = {
  args: {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Ventas', path: '/sales' },
      { label: 'Crédito', path: '/sales/credit' },
      { label: 'Nueva Venta', path: '/sales/credit/new' },
    ],
  },
};