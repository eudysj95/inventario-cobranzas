import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Badge' } };
export const Success: Story = { args: { children: 'Success', variant: 'success' } };
export const Warning: Story = { args: { children: 'Warning', variant: 'warning' } };
export const Danger: Story = { args: { children: 'Danger', variant: 'danger' } };
export const Info: Story = { args: { children: 'Info', variant: 'info' } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const WithDot: Story = { args: { children: 'Active', variant: 'success', dot: true } };