import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    shape: { control: { type: 'select' }, options: ['circle', 'square'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { name: 'John Doe' } };
export const WithImage: Story = { args: { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', alt: 'John Doe' } };
export const Small: Story = { args: { name: 'Jane Smith', size: 'sm' } };
export const Large: Story = { args: { name: 'Bob Wilson', size: 'lg' } };
export const Square: Story = { args: { name: 'Square Avatar', shape: 'square' } };
export const Fallback: Story = { args: { name: 'A' } };