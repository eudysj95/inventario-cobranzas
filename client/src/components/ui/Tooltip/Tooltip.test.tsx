import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("shows tooltip on hover", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Hover me" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip text");
  });

  it("hides tooltip on mouse leave", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(button);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip text");
  });

  it("hides tooltip on blur", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.blur(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("applies position classes correctly", () => {
    const { rerender } = render(
      <Tooltip content="Top" position="top"><button>Btn</button></Tooltip>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveClass("top");

    rerender(<Tooltip content="Bottom" position="bottom"><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveClass("bottom");

    rerender(<Tooltip content="Left" position="left"><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveClass("left");

    rerender(<Tooltip content="Right" position="right"><button>Btn</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveClass("right");
  });

  it("renders children correctly", () => {
    render(<Tooltip content="Tip"><span>Child</span></Tooltip>);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});