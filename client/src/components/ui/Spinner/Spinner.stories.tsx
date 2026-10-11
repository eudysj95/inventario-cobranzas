import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Primitives/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const InButton: Story = { render: () => <button type="button" disabled><Spinner size="sm" /> Loading...</button> };
export const Inline: Story = { render: () => <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}><Spinner size="sm" /><span>Loading data...</span></div> };