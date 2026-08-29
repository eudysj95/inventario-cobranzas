import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Primitives/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A notification toast component wrapping the .alert utility classes. Used for transient notifications with optional action button and close button.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["success", "error", "warning", "info"] },
    message: { control: "text" },
    action: { control: "object" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    message: "Changes saved successfully!",
    variant: "success",
  },
};

export const Error: Story = {
  args: {
    message: "Failed to save changes. Please try again.",
    variant: "error",
  },
};

export const Warning: Story = {
  args: {
    message: "Your session will expire in 5 minutes.",
    variant: "warning",
  },
};

export const Info: Story = {
  args: {
    message: "New feature available! Check out the updates.",
    variant: "info",
  },
};

export const WithAction: Story = {
  args: {
    message: "Item deleted",
    variant: "success",
    action: { label: "Undo", onClick: () => alert("Undo clicked!") },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Toast message="Success toast" variant="success" />
      <Toast message="Error toast" variant="error" />
      <Toast message="Warning toast" variant="warning" />
      <Toast message="Info toast" variant="info" />
    </div>
  ),
};