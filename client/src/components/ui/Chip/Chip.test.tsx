import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders chip with label", () => {
    render(<Chip label="React" />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("React").closest(".chip")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Chip label="Primary" variant="primary" />);
    expect(screen.getByText("Primary")).toHaveClass("chip-primary");

    rerender(<Chip label="Success" variant="success" />);
    expect(screen.getByText("Success")).toHaveClass("chip-success");

    rerender(<Chip label="Warning" variant="warning" />);
    expect(screen.getByText("Warning")).toHaveClass("chip-warning");

    rerender(<Chip label="Danger" variant="danger" />);
    expect(screen.getByText("Danger")).toHaveClass("chip-danger");

    rerender(<Chip label="Info" variant="info" />);
    expect(screen.getByText("Info")).toHaveClass("chip-info");

    rerender(<Chip label="Neutral" variant="neutral" />);
    expect(screen.getByText("Neutral")).toHaveClass("chip-neutral");
  });

  it("shows remove button when onRemove provided", () => {
    const handleRemove = vi.fn();
    render(<Chip label="Removable" onRemove={handleRemove} />);
    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("does not show remove button when onRemove not provided", () => {
    render(<Chip label="Not removable" />);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Chip label="Small" size="sm" />);
    expect(screen.getByText("Small")).toHaveClass("chip-sm");

    rerender(<Chip label="Medium" size="md" />);
    expect(screen.getByText("Medium")).not.toHaveClass("chip-sm");
  });

  it("handles disabled state", () => {
    const handleRemove = vi.fn();
    render(<Chip label="Disabled" onRemove={handleRemove} disabled />);
    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeDisabled();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Chip label="Ref test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});