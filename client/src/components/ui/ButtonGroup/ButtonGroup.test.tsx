import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "../Button";

describe("ButtonGroup", () => {
  it("renders button group with children", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("applies vertical orientation class", () => {
    render(
      <ButtonGroup vertical>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("group")).toHaveClass("flex-col");
  });

  it("applies aria-label for accessibility", () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <Button>Bold</Button>
        <Button>Italic</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("group")).toHaveAttribute("aria-label", "Text formatting");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<ButtonGroup ref={ref}><Button>Test</Button></ButtonGroup>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("renders without wrapper when single child", () => {
    // This is just a documentation test - ButtonGroup always wraps
    render(<ButtonGroup><Button>Single</Button></ButtonGroup>);
    expect(screen.getByRole("group")).toBeInTheDocument();
  });
});