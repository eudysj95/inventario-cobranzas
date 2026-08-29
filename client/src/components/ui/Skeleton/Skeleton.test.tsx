import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders skeleton with default variant", () => {
    render(<Skeleton />);
    expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse", "bg-surface-hover");
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Skeleton variant="text" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("h-4", "rounded");

    rerender(<Skeleton variant="circular" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("rounded-full");

    rerender(<Skeleton variant="rectangular" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("rounded-lg");
  });

  it("applies width and height", () => {
    render(<Skeleton width="100px" height="20px" />);
    expect(screen.getByTestId("skeleton")).toHaveStyle({ width: "100px", height: "20px" });
  });

  it("applies custom className", () => {
    render(<Skeleton className="custom-skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("custom-skeleton");
  });
});