import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders avatar with image", () => {
    render(<Avatar src="/avatar.png" alt="User Name" />);
    const img = screen.getByAltText("User Name");
    expect(img).toHaveAttribute("src", "/avatar.png");
    expect(img).toHaveClass("rounded-full");
  });

  it("renders fallback initials when no image", () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders fallback single initial when name has one word", () => {
    render(<Avatar name="John" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Avatar name="Test" size="xs" />);
    expect(screen.getByText("T")).toHaveClass("w-6", "h-6", "text-xs");

    rerender(<Avatar name="Test" size="sm" />);
    expect(screen.getByText("T")).toHaveClass("w-8", "h-8", "text-sm");

    rerender(<Avatar name="Test" size="md" />);
    expect(screen.getByText("T")).toHaveClass("w-10", "h-10", "text-base");

    rerender(<Avatar name="Test" size="lg" />);
    expect(screen.getByText("T")).toHaveClass("w-12", "h-12", "text-lg");

    rerender(<Avatar name="Test" size="xl" />);
    expect(screen.getByText("T")).toHaveClass("w-16", "h-16", "text-xl");
  });

  it("applies shape classes correctly", () => {
    const { rerender } = render(<Avatar name="Test" shape="circle" />);
    expect(screen.getByText("T").closest("div")).toHaveClass("rounded-full");

    rerender(<Avatar name="Test" shape="square" />);
    expect(screen.getByText("T").closest("div")).toHaveClass("rounded-lg");
  });

  it("shows status indicator when status prop provided", () => {
    render(<Avatar name="Test" status="online" />);
    expect(screen.getByText("T").closest("div")?.querySelector(".absolute")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Avatar name="Ref test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});