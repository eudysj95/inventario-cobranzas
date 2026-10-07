import type { Meta, StoryObj } from '@storybook/react';
import { FormLayout } from './FormLayout';

const meta: Meta<typeof FormLayout> = {
  title: 'Forms/FormLayout',
  component: FormLayout,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label>Name <input type="text" placeholder="Enter name" /></label>
        <label>Email <input type="email" placeholder="Enter email" /></label>
        <label>Phone <input type="tel" placeholder="Enter phone" /></label>
      </div>
    ),
  },
};

export const WithPreview: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label>Product Name <input type="text" placeholder="Product name" /></label>
        <label>Price <input type="number" placeholder="0.00" step="0.01" /></label>
        <label>Description <textarea placeholder="Product description" rows={3} /></label>
      </div>
    ),
  },
};