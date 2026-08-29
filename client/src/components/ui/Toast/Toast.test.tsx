import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders toast with title", () => {
    render(<Toast title="Success!" />);
    expect(screen.getByRole("status")).toHaveTextContent("Success!");
  });

  it("renders toast with title and description", () => {
    render(<Toast title="Success!" description="Operation completed" />);
    expect(screen.getByRole("status")).toHaveTextContent("Success!");
    expect(screen.getByRole("status")).toHaveTextContent("Operation completed");
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Toast title="Success" variant="success" />);
    expect(screen.getByRole("status")).toHaveClass("alert-success");

    rerender(<Toast title="Error" variant="error" />);
    expect(screen.getByRole("status")).toHaveClass("alert-error");

    rerender(<Toast title="Warning" variant="warning" />);
    expect(screen.getByRole("status")).toHaveClass("alert-warning");

    rerender(<Toast title="Info" variant="info" />);
    expect(screen.getByRole("status")).toHaveClass("alert-info");
  });

  it("shows action button when provided", () => {
    const handleAction = vi.fn();
    render(<Toast title="Saved" action={{ label: "Undo", onClick: handleAction }} />);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("shows close button", () => {
    const onClose = vi.fn();
    render(<Toast title="Test" onClose={onClose} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Toast title="Test" className="custom-toast" />);
    expect(screen.getByRole("status")).toHaveClass("custom-toast");
  });
});