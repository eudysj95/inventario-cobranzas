import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders spinner", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole("status")).toHaveClass("w-4", "h-4", "border-[2px]");

    rerender(<Spinner size="md" />);
    expect(screen.getByRole("status")).toHaveClass("w-6", "h-6", "border-[2px]");

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("w-8", "h-8", "border-[3px]");
  });

  it("applies color variant correctly", () => {
    const { rerender } = render(<Spinner variant="primary" />);
    expect(screen.getByRole("status")).toHaveClass("border-primary", "border-t-primary");

    rerender(<Spinner variant="white" />);
    expect(screen.getByRole("status")).toHaveClass("border-white", "border-t-white");
  });

  it("shows label when provided", () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving changes");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Spinner ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});