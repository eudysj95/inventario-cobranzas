import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    removable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Chip' } };
export const Success: Story = { args: { children: 'Approved', variant: 'success' } };
export const Warning: Story = { args: { children: 'Pending', variant: 'warning' } };
export const Danger: Story = { args: { children: 'Rejected', variant: 'danger' } };
export const Info: Story = { args: { children: 'Info', variant: 'info' } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Removable: Story = { args: { children: 'Removable', removable: true, onRemove: () => {} } };