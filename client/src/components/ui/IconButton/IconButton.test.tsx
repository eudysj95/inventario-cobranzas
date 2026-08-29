import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders icon button with icon and accessible label", () => {
    render(<IconButton aria-label="Close" icon={<span data-testid="icon">×</span>} />);
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<IconButton aria-label="Primary" icon={<span />} variant="primary" />);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");

    rerender(<IconButton aria-label="Secondary" icon={<span />} variant="secondary" />);
    expect(screen.getByRole("button")).toHaveClass("btn-secondary");

    rerender(<IconButton aria-label="Danger" icon={<span />} variant="danger" />);
    expect(screen.getByRole("button")).toHaveClass("btn-danger");

    rerender(<IconButton aria-label="Ghost" icon={<span />} variant="ghost" />);
    expect(screen.getByRole("button")).toHaveClass("btn-ghost");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<IconButton aria-label="Small" icon={<span />} size="sm" />);
    expect(screen.getByRole("button")).toHaveClass("btn-sm");

    rerender(<IconButton aria-label="Large" icon={<span />} size="lg" />);
    expect(screen.getByRole("button")).toHaveClass("btn-lg");
  });

  it("handles disabled state", () => {
    render(<IconButton aria-label="Disabled" icon={<span />} disabled />);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });

  it("handles loading state", () => {
    render(<IconButton aria-label="Loading" icon={<span />} loading />);
    const button = screen.getByRole("button", { name: "Loading" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("calls onClick handler", () => {
    const handleClick = vi.fn();
    render(<IconButton aria-label="Click" icon={<span />} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<IconButton aria-label="Disabled" icon={<span />} disabled onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("requires aria-label or aria-labelledby", () => {
    // This test documents the accessibility requirement
    const { container } = render(<IconButton icon={<span />} />);
    const button = container.querySelector("button");
    // Should still render but warn in console about missing accessible name
    expect(button).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<IconButton aria-label="Ref test" icon={<span />} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it("applies round class when round prop is true", () => {
    render(<IconButton aria-label="Round" icon={<span />} round />);
    expect(screen.getByRole("button")).toHaveClass("rounded-full");
  });
});