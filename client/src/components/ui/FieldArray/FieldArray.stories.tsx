import type { Meta, StoryObj } from '@storybook/react';
import { FieldArray } from './FieldArray';

const meta: Meta<typeof FieldArray> = {
  title: 'Primitives/FieldArray',
  component: FieldArray,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'items',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    ],
    initialValues: [
      { name: 'Item 1', quantity: 1 },
      { name: 'Item 2', quantity: 2 },
    ],
  },
};

export const Empty: Story = {
  args: {
    name: 'items',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
    ],
    initialValues: [],
  },
};