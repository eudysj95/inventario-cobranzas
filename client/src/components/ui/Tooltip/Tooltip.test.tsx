import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("shows tooltip on hover", async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Hover me" });
    // Tooltip is portaled to document.body, not in container
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent("Tooltip text"));
  });

  it("hides tooltip on mouse leave", async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toBeInTheDocument());

    fireEvent.mouseLeave(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).not.toBeInTheDocument());
  });

  it("shows tooltip on focus", async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent("Tooltip text"));
  });

  it("hides tooltip on blur", async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toBeInTheDocument());

    fireEvent.blur(button);
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).not.toBeInTheDocument());
  });

  it("applies position classes correctly", async () => {
    const { rerender } = render(
      <Tooltip content="Top" position="top" delay={0}><button>Btn</button></Tooltip>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveClass("tooltip-top"));

    rerender(<Tooltip content="Bottom" position="bottom" delay={0}><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveClass("tooltip-bottom"));

    rerender(<Tooltip content="Left" position="left" delay={0}><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveClass("tooltip-left"));

    rerender(<Tooltip content="Right" position="right" delay={0}><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    await waitFor(() => expect(document.body.querySelector('[role="tooltip"]')).toHaveClass("tooltip-right"));
  });

  it("renders children correctly", () => {
    render(<Tooltip content="Tip"><span>Child</span></Tooltip>);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});