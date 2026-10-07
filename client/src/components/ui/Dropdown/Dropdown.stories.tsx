import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Primitives/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    trigger: { control: { type: 'select' }, options: ['click', 'hover'] },
    placement: { control: { type: 'select' }, options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <button type="button">Open Dropdown</button>,
    items: [
      { label: 'Item 1', onClick: () => console.log('Item 1') },
      { label: 'Item 2', onClick: () => console.log('Item 2') },
      { type: 'separator' },
      { label: 'Item 3', onClick: () => console.log('Item 3'), danger: true },
    ],
  },
};

export const HoverTrigger: Story = { args: { ...Default.args, trigger: 'hover' } };
export const BottomEnd: Story = { args: { ...Default.args, placement: 'bottom-end' } };