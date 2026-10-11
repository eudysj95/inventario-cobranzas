import type { Meta, StoryObj } from '@storybook/react';
import { Field } from './Field';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: { type: 'select' }, options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Email', type: 'email', placeholder: 'Enter email' } };
export const Required: Story = { args: { label: 'Name', required: true, placeholder: 'Enter name' } };
export const WithError: Story = { args: { label: 'Email', type: 'email', error: 'Invalid email format' } };
export const WithHelp: Story = { args: { label: 'Password', type: 'password', help: 'Must be at least 8 characters' } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true, value: 'Cannot edit' } };