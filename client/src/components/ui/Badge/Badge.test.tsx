import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders badge with children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("New").closest(".chip")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText("Primary")).toHaveClass("chip-primary");

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("chip-success");

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toHaveClass("chip-warning");

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass("chip-danger");

    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info")).toHaveClass("chip-info");

    rerender(<Badge variant="neutral">Neutral</Badge>);
    expect(screen.getByText("Neutral")).toHaveClass("chip-neutral");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toHaveClass("chip-sm");

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText("Medium")).not.toHaveClass("chip-sm");
  });

  it("applies dot indicator when dot prop is true", () => {
    render(<Badge dot>Active</Badge>);
    expect(screen.getByText("Active").closest(".chip")).toHaveClass("flex");
    expect(screen.getByText("Active").closest(".chip")?.querySelector("::before")).toBeTruthy();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Badge ref={ref}>Ref test</Badge>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});