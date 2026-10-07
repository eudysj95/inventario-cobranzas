import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders textarea with label", () => {
    render(<Textarea label="Message" id="message" />);
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it("handles value and onChange", () => {
    const handleChange = vi.fn();
    render(<Textarea id="test" value="Hello" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "World" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("handles disabled state", () => {
    render(<Textarea id="disabled" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("handles required attribute", () => {
    render(<Textarea id="required" required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("shows error state with aria-invalid", () => {
    render(<Textarea id="error" error="Message too short" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Message too short")).toBeInTheDocument();
  });

  it("shows hint text", () => {
    render(<Textarea id="hint" hint="Enter your message" />);
    expect(screen.getByText("Enter your message")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Textarea id="ref-test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it("applies rows attribute", () => {
    render(<Textarea id="rows" rows={5} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
  });

  it("applies placeholder", () => {
    render(<Textarea id="placeholder" placeholder="Type here..." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Type here...");
  });

  it("generates unique id when not provided", () => {
    const { container } = render(<Textarea label="Auto ID" />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveAttribute("id");
    // useId() generates IDs like :r0:, :r1: etc.
    expect(textarea?.id).toBeTruthy();
  });
});