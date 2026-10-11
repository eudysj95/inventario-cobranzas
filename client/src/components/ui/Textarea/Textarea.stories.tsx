import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Description', placeholder: 'Enter description' } };
export const Required: Story = { args: { label: 'Comments', required: true, placeholder: 'Your comments' } };
export const WithError: Story = { args: { label: 'Bio', error: 'Maximum 500 characters' } };
export const WithHelp: Story = { args: { label: 'Address', help: 'Include street, city, and postal code' } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true, value: 'Cannot edit' } };
export const Small: Story = { args: { size: 'sm', label: 'Small', placeholder: 'Small textarea' } };
export const Large: Story = { args: { size: 'lg', label: 'Large', placeholder: 'Large textarea' } };