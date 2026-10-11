import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FieldArray } from "./FieldArray";

describe("FieldArray", () => {
  const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
    <div>
      <input placeholder={`Item ${index + 1}`} data-testid={`field-${index}`} />
      <button type="button" onClick={remove}>Remove</button>
    </div>
  );

  it("renders field array with initial fields", () => {
    render(
      <FieldArray name="items" initialValues={["A", "B"]} render={renderField} />
    );

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Item 2")).toBeInTheDocument();
  });

  it("adds new field when add button clicked", () => {
    render(<FieldArray name="items" initialValues={["A"]} render={renderField} />);

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Item 2")).not.toBeInTheDocument();

    // Add button has aria-label "Add items" and text "+ Add"
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByPlaceholderText("Item 2")).toBeInTheDocument();
  });

  it("removes field when remove button clicked", () => {
    render(<FieldArray name="items" initialValues={["A", "B"]} render={renderField} />);

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Item 2")).not.toBeInTheDocument();
  });

  it("shows add button with custom label", () => {
    const simpleRenderField = ({ index }: { index: number }) => (
      <div><input placeholder={`Item ${index + 1}`} /></div>
    );

    render(<FieldArray name="items" render={simpleRenderField} addButtonLabel="Add Item" />);
    // Add button has aria-label "Add items" (from name prop) and text "+ Add Item"
    expect(screen.getByRole("button", { name: /add items/i })).toBeInTheDocument();
    expect(screen.getByText("+ Add Item")).toBeInTheDocument();
  });

  it("enforces minItems by preventing removal", () => {
    render(<FieldArray name="items" initialValues={["A"]} render={renderField} minItems={1} />);

    const removeButton = screen.getByRole("button", { name: /remove/i });
    // Component doesn't disable button; it prevents removal in handler
    expect(removeButton).not.toBeDisabled();

    // Clicking remove should not remove the last item (minItems=1)
    fireEvent.click(removeButton);
    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
  });

  it("enforces maxItems by disabling add button", () => {
    render(<FieldArray name="items" initialValues={["A", "B"]} render={renderField} maxItems={2} />);

    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();
  });
});