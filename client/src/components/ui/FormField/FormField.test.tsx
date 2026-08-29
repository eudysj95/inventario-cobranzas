import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders form field with label and children", () => {
    render(
      <FormField label="Email" required>
        <input type="email" id="email" />
      </FormField>
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows hint text", () => {
    render(
      <FormField label="Password" hint="Min 8 characters">
        <input type="password" id="password" />
      </FormField>
    );
    expect(screen.getByText("Min 8 characters")).toBeInTheDocument();
  });

  it("shows error text", () => {
    render(
      <FormField label="Email" error="Invalid email format">
        <input type="email" id="email" />
      </FormField>
    );
    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
  });

  it("hides hint when error is present", () => {
    render(
      <FormField label="Email" hint="Enter email" error="Invalid">
        <input type="email" id="email" />
      </FormField>
    );
    expect(screen.getByText("Invalid")).toBeInTheDocument();
    expect(screen.queryByText("Enter email")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <FormField label="Test" className="custom-class">
        <input id="test" />
      </FormField>
    );
    expect(screen.getByLabelText("Test").closest("div")).toHaveClass("custom-class");
  });

  it("renders without label when not provided", () => {
    render(
      <FormField>
        <input id="no-label" />
      </FormField>
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });
});