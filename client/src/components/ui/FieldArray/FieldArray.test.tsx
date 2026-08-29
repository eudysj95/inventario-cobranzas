import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FieldArray } from "./FieldArray";

describe("FieldArray", () => {
  it("renders field array with initial fields", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div>
        <input placeholder={`Item ${index + 1}`} data-testid={`field-${index}`} />
        <button type="button" onClick={remove}>Remove</button>
      </div>
    );

    render(
      <FieldArray name="items" initialValues={["A", "B"]} render={renderField} />
    );

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Item 2")).toBeInTheDocument();
  });

  it("adds new field when add button clicked", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div>
        <input placeholder={`Item ${index + 1}`} data-testid={`field-${index}`} />
        <button type="button" onClick={remove}>Remove</button>
      </div>
    );

    render(<FieldArray name="items" initialValues={["A"]} render={renderField} />);

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Item 2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByPlaceholderText("Item 2")).toBeInTheDocument();
  });

  it("removes field when remove button clicked", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div>
        <input placeholder={`Item ${index + 1}`} data-testid={`field-${index}`} />
        <button type="button" onClick={remove}>Remove</button>
      </div>
    );

    render(<FieldArray name="items" initialValues={["A", "B"]} render={renderField} />);

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.getByPlaceholderText("Item 1")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Item 2")).not.toBeInTheDocument();
  });

  it("shows add button with custom label", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div><input placeholder={`Item ${index + 1}`} /></div>
    );

    render(<FieldArray name="items" render={renderField} addButtonLabel="Add Item" />);
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("enforces minItems", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div>
        <input placeholder={`Item ${index + 1}`} />
        <button type="button" onClick={remove}>Remove</button>
      </div>
    );

    render(<FieldArray name="items" initialValues={["A"]} render={renderField} minItems={1} />);

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeDisabled();
  });

  it("enforces maxItems", () => {
    const renderField = ({ index, remove }: { index: number; remove: () => void }) => (
      <div>
        <input placeholder={`Item ${index + 1}`} />
        <button type="button" onClick={remove}>Remove</button>
      </div>
    );

    render(<FieldArray name="items" initialValues={["A", "B"]} render={renderField} maxItems={2} />);

    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();
  });
});