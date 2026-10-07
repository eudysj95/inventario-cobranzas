import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Primitives/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['single', 'multiple'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', title: 'Section 1', content: <p>Content for section 1</p> },
      { id: '2', title: 'Section 2', content: <p>Content for section 2</p> },
      { id: '3', title: 'Section 3', content: <p>Content for section 3</p> },
    ],
  },
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    items: [
      { id: '1', title: 'Section 1', content: <p>Content for section 1</p> },
      { id: '2', title: 'Section 2', content: <p>Content for section 2</p> },
      { id: '3', title: 'Section 3', content: <p>Content for section 3</p> },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { id: '1', title: 'Account Settings', content: <p>Manage your account settings</p> },
      { id: '2', title: 'Notifications', content: <p>Configure notification preferences</p> },
      { id: '3', title: 'Security', content: <p>Security and privacy settings</p> },
    ],
  },
};