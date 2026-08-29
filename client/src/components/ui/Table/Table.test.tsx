import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table";

describe("Table", () => {
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
  ];

  const data = [
    { id: 1, name: "John", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane", email: "jane@example.com", role: "User" },
  ];

  it("renders table with headers and data", () => {
    render(<Table columns={columns} data={data} keyField="id" />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders custom cell renderers", () => {
    const columnsWithRenderer = [
      { key: "name", header: "Name" },
      { key: "actions", header: "Actions", render: () => <button>Edit</button> },
    ];

    render(<Table columns={columnsWithRenderer} data={data} keyField="id" />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<Table columns={columns} data={[]} keyField="id" emptyMessage="No users found" />);
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("applies striped rows when striped prop is true", () => {
    render(<Table columns={columns} data={data} keyField="id" striped />);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("bg-surface-hover");
  });

  it("applies hover effect when hoverable prop is true", () => {
    render(<Table columns={columns} data={data} keyField="id" hoverable />);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("hover:bg-surface-hover");
  });

  it("renders caption when provided", () => {
    render(<Table columns={columns} data={data} keyField="id" caption="User List" />);
    expect(screen.getByCaptionText("User List")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Table columns={columns} data={data} keyField="id" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});