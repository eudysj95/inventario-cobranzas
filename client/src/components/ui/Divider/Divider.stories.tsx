import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Primitives/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: { type: 'select' }, options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { args: {} };
export const Vertical: Story = { args: { orientation: 'vertical' }, decorators: [(Story) => <div style={{ height: '100px' }}><Story /></div>] };
export const WithText: Story = { args: { children: 'OR' } };