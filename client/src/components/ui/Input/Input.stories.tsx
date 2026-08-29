import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A styled text input component wrapping the .input utility class. Supports label, hint, error states, and full accessibility attributes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "number", "tel", "url"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "text" },
    hint: { control: "text" },
    value: { control: "text" },
    onChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
};

export const WithHint: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    hint: "Must be at least 8 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    value: "invalid-email",
    error: "Please enter a valid email address",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit",
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: "Username",
    placeholder: "Enter username",
    required: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input label="Default" placeholder="Default state" />
      <Input label="With Hint" placeholder="Has hint" hint="Helper text here" />
      <Input label="Error State" value="invalid" error="This field has an error" />
      <Input label="Disabled" placeholder="Disabled" disabled />
    </div>
  ),
};