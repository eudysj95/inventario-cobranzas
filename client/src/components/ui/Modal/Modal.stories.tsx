import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button";

const meta: Meta<typeof Modal> = {
  title: "Primitives/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "An accessible dialog component with backdrop, focus trap, and animations. Uses portal to render at document root.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    closeOnBackdrop: { control: "boolean" },
    closeOnEscape: { control: "boolean" },
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalStory = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.open);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        {...args}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>This is the modal content. You can put any content here including forms, text, or other components.</p>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: ModalStory,
  args: {
    title: "Modal Title",
    open: false,
  },
};

export const Small: Story = {
  render: ModalStory,
  args: {
    title: "Small Modal",
    size: "sm",
    open: false,
  },
};

export const Large: Story = {
  render: ModalStory,
  args: {
    title: "Large Modal",
    size: "lg",
    open: false,
  },
};

export const WithoutTitle: Story = {
  render: ModalStory,
  args: {
    open: false,
  },
};

export const ConfirmationDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Item</Button>
        <Modal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Deletion"
          size="sm"
          footerActions={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setIsOpen(false)}>Delete</Button>
            </>
          }
        >
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>
    );
  },
};