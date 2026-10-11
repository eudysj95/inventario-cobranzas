import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  const options = [
    { value: "", label: "Select an option" },
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  it("renders select with label and options", () => {
    render(<Select label="Choose" id="select" options={options} />);
    expect(screen.getByLabelText(/Choose/)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Select an option")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("handles value and onChange", () => {
    const handleChange = vi.fn();
    render(<Select id="select" options={options} value="a" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("handles disabled state", () => {
    render(<Select id="disabled" options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("handles required attribute", () => {
    render(<Select id="required" options={options} required />);
    expect(screen.getByRole("combobox")).toBeRequired();
  });

  it("shows error state with aria-invalid", () => {
    render(<Select id="error" options={options} error="Required field" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("shows hint text", () => {
    render(<Select id="hint" options={options} hint="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Select id="ref-test" options={options} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement));
  });

  it("generates unique id when not provided", () => {
    const { container } = render(<Select label="Auto ID" options={options} />);
    const select = container.querySelector("select");
    expect(select).toHaveAttribute("id");
    // useId() generates IDs like :r0:, :r1: etc.
    expect(select?.id).toBeTruthy();
  });

  it("renders placeholder option when value is empty", () => {
    render(<Select id="placeholder" options={options} placeholder="Choose..." />);
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });
});