import type { Meta, StoryObj } from '@storybook/react';
import { WhatsAppHub } from './WhatsAppHub';

const meta: Meta<typeof WhatsAppHub> = {
  title: 'WhatsApp/WhatsAppHub',
  component: WhatsAppHub,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['fab', 'inline', 'button'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FAB: Story = { args: { variant: 'fab', phoneNumber: '+5491123456789' } };
export const Inline: Story = { args: { variant: 'inline', phoneNumber: '+5491123456789', message: 'Hola, me interesa tu producto' } };
export const Button: Story = { args: { variant: 'button', phoneNumber: '+5491123456789' } };
export const WithTemplate: Story = { args: { variant: 'button', phoneNumber: '+5491123456789', template: 'payment_reminder', templateParams: { name: 'Juan', amount: '$5000', dueDate: '2024-01-15' } } };