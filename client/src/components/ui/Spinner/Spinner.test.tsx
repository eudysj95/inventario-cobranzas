import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders spinner", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender, container } = render(<Spinner size="sm" />);
    // Size classes are on the SVG element
    expect(container.querySelector("svg")).toHaveClass("w-4", "h-4", "border-[2px]");

    rerender(<Spinner size="md" />);
    expect(container.querySelector("svg")).toHaveClass("w-6", "h-6", "border-[2px]");

    rerender(<Spinner size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("w-8", "h-8", "border-[3px]");
  });

  it("applies color variant correctly", () => {
    const { rerender, container } = render(<Spinner variant="primary" />);
    // Component uses border-border border-t-primary for primary on the SVG
    expect(container.querySelector("svg")).toHaveClass("border-border", "border-t-primary");

    rerender(<Spinner variant="white" />);
    // Component uses border-white/30 border-t-white for white on the SVG
    expect(container.querySelector("svg")).toHaveClass("border-white/30", "border-t-white");
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