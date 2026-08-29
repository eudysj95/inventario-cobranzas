import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./Table";
import { Badge } from "../Badge";

const meta: Meta<typeof Table> = {
  title: "Primitives/Table",
  component: Table,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A data table component wrapping the .table utility classes. Supports custom cell renderers, striped rows, hover effects, and empty states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    striped: { control: "boolean" },
    hoverable: { control: "boolean" },
    emptyMessage: { control: "text" },
    caption: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", render: (value: string) => <Badge variant={value === "Admin" ? "primary" : "neutral"}>{value}</Badge> },
  { key: "status", header: "Status", render: (value: string) => <Badge variant={value === "Active" ? "success" : "warning"}>{value}</Badge> },
];

const data = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "User", status: "Inactive" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Editor", status: "Active" },
];

export const Default: Story = {
  args: {
    columns,
    data,
    keyField: "id",
  },
};

export const Striped: Story = {
  args: {
    columns,
    data,
    keyField: "id",
    striped: true,
  },
};

export const Hoverable: Story = {
  args: {
    columns,
    data,
    keyField: "id",
    hoverable: true,
  },
};

export const WithCaption: Story = {
  args: {
    columns,
    data,
    keyField: "id",
    caption: "User Directory - 4 users",
    striped: true,
    hoverable: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    keyField: "id",
    emptyMessage: "No users found. Click 'Add User' to get started.",
  },
};

export const WithActions: Story = {
  args: {
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "actions", header: "Actions", render: () => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm">Edit</button>
          <button className="btn btn-ghost btn-sm text-danger">Delete</button>
        </div>
      )},
    ],
    data,
    keyField: "id",
    striped: true,
    hoverable: true,
  },
};