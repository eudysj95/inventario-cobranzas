import type { Meta, StoryObj } from "@storybook/react";
import { WhatsAppHub } from "./WhatsAppHub";

const meta: Meta<typeof WhatsAppHub> = {
  title: "WhatsApp/WhatsAppHub",
  component: WhatsAppHub,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "WhatsApp contact component with FAB, inline, and button variants. Generates wa.me deep links with template interpolation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["fab", "inline", "button"] },
    template: { control: "select", options: ["collection", "saleConfirmation", "apartadoReminder", "custom"] },
    phone: { control: "text" },
    message: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof WhatsAppHub>;

export const FAB: Story = {
  args: {
    phone: "+5491123456789",
    variant: "fab",
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: "300px", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export const Inline: Story = {
  args: {
    phone: "+5491123456789",
    variant: "inline",
  },
};

export const Button: Story = {
  args: {
    phone: "+5491123456789",
    variant: "button",
  },
};

export const ButtonWithTemplate: Story = {
  args: {
    phone: "+5491123456789",
    variant: "button",
    template: "collection",
    prefillData: {
      customerName: "Juan Pérez",
      amount: "$1.500",
      dueDate: "15/08/2026",
    },
  },
};

export const InlineWithTemplate: Story = {
  args: {
    phone: "+5491123456789",
    variant: "inline",
    template: "saleConfirmation",
    prefillData: {
      orderId: "ORD-456",
      amount: "$3.200",
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <WhatsAppHub phone="+5491123456789" variant="fab" />
        <span className="text-sm text-muted-foreground">FAB (fixed bottom-right in real app)</span>
      </div>
      <div className="flex items-center gap-4">
        <WhatsAppHub phone="+5491123456789" variant="inline" />
        <span className="text-sm text-muted-foreground">Inline (for table rows)</span>
      </div>
      <div className="flex items-center gap-4">
        <WhatsAppHub phone="+5491123456789" variant="button" />
        <span className="text-sm text-muted-foreground">Button (for forms/modals)</span>
      </div>
    </div>
  ),
};