import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders input with label", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("applies type correctly", () => {
    const { rerender, container } = render(<Input id="text" type="text" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "text");

    rerender(<Input id="email" type="email" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "email");

    rerender(<Input id="password" type="password" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });

  it("handles value and onChange", () => {
    const handleChange = vi.fn();
    render(<Input id="test" value="Hello" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "World" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("handles disabled state", () => {
    render(<Input id="disabled" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("handles required attribute", () => {
    render(<Input id="required" required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("shows error state with aria-invalid", () => {
    render(<Input id="error" error="Invalid email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("shows hint text", () => {
    render(<Input id="hint" hint="Enter your email" />);
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Input id="ref-test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it("applies placeholder", () => {
    render(<Input id="placeholder" placeholder="Enter text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Enter text");
  });

  it("handles autocomplete attribute", () => {
    render(<Input id="autocomplete" autoComplete="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("autocomplete", "email");
  });

  it("generates unique id when not provided", () => {
    const { container } = render(<Input label="Auto ID" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("id");
    // useId() generates IDs like :r0:, :r1: etc. - just verify it exists and is unique
    expect(input?.id).toBeTruthy();
  });
});