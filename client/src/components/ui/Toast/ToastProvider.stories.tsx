import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./ToastProvider";
import { Toast } from "./Toast";
import { Button } from "../Button";

// Simple test component to demonstrate useToast
function ToastDemo() {
  const { toast, dismissAll } = useToast();

  return (
    <div className="space-y-2">
      <Button onClick={() => toast({ variant: "success", title: "Success!", description: "Operation completed successfully" })}>Show Success</Button>
      <Button onClick={() => toast({ variant: "error", title: "Error!", description: "Something went wrong" })} variant="destructive">Show Error</Button>
      <Button onClick={() => toast({ variant: "warning", title: "Warning!", description: "Please be careful" })} variant="outline">Show Warning</Button>
      <Button onClick={() => toast({ variant: "info", title: "Info", description: "Just an informational message" })} variant="secondary">Show Info</Button>
      <Button onClick={() => toast({ variant: "success", title: "Saved", description: "Your changes were saved", action: { label: "Undo", onClick: () => alert("Undo clicked!") } })}>Show With Action</Button>
      <Button onClick={() => toast({ variant: "success", title: "No Auto-dismiss", description: "This toast stays until dismissed", duration: 0 })}>Show Persistent</Button>
      <Button onClick={dismissAll} variant="ghost">Dismiss All</Button>
    </div>
  );
}

const meta: Meta<typeof ToastProvider> = {
  title: "Primitives/ToastProvider",
  component: ToastProvider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "ToastProvider manages toast notifications via portal. Wrap your app with it and use the useToast hook to show toasts.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Default: Story = {
  render: () => <ToastDemo />,
};

export const MultipleToasts: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <Button onClick={() => {
        toast({ variant: "success", title: "Toast 1", description: "First toast" });
        toast({ variant: "error", title: "Toast 2", description: "Second toast" });
        toast({ variant: "warning", title: "Toast 3", description: "Third toast" });
      }}>
        Show 3 Toasts
      </Button>
    );
  },
};