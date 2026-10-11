import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'outline'] },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <button type="button" key="1">One</button>,
      <button type="button" key="2">Two</button>,
      <button type="button" key="3">Three</button>,
    ],
  },
};

export const WithIcons: Story = {
  args: {
    children: [
      <button type="button" key="1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg></button>,
      <button type="button" key="2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="10 17 16 11 10 5" /><line x1="4" y1="19" x2="12" y2="19" /></svg></button>,
      <button type="button" key="3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg></button>,
    ],
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: [
      <button type="button" key="1">Left</button>,
      <button type="button" key="2">Center</button>,
      <button type="button" key="3">Right</button>,
    ],
  },
};