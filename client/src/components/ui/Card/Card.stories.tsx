import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import { Button } from "../Button";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A container component with header, body, and footer sections. Wraps the .card utility classes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-text-secondary">This is the card body content. You can put any content here.</p>
      </CardBody>
      <CardFooter>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardBody>
        <p>Simple card without header or footer.</p>
      </CardBody>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-80">
      <div className="aspect-video bg-primary-light relative overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          Image Placeholder
        </div>
      </div>
      <CardBody>
        <h4 className="font-semibold">Card with Image</h4>
        <p className="text-text-secondary mt-1">This card has an image at the top.</p>
      </CardBody>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-80 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <h3 className="text-lg font-semibold">Interactive Card</h3>
      </CardHeader>
      <CardBody>
        <p className="text-text-secondary">Click this card to trigger an action.</p>
      </CardBody>
    </Card>
  ),
};