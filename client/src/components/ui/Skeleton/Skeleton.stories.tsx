import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['text', 'rectangular', 'circular'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { variant: 'text', width: '100%', count: 3 } };
export const Rectangular: Story = { args: { variant: 'rectangular', width: '200px', height: '100px' } };
export const Circular: Story = { args: { variant: 'circular', size: '48px' } };
export const Card: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <Skeleton variant="rectangular" width="100%" height="150px" />
      <div style={{ padding: '16px' }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};