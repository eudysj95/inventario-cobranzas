import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Field } from "./Field";
import { Input } from "../ui/Input";

describe("Field", () => {
  it("renders label and input", () => {
    render(
      <Field label="Nombre">
        <Input placeholder="Ingrese nombre" />
      </Field>
    );

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ingrese nombre")).toBeInTheDocument();
  });

  it("renders required indicator when required=true", () => {
    render(
      <Field label="Email" required>
        <Input type="email" />
      </Field>
    );

    const input = screen.getByLabelText(/email/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders hint text when provided", () => {
    render(
      <Field label="Password" hint="Mínimo 8 caracteres">
        <Input type="password" />
      </Field>
    );

    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("renders error message and associates with input via aria-describedby", () => {
    render(
      <Field label="Email" error="Email inválido">
        <Input type="email" />
      </Field>
    );

    const input = screen.getByLabelText("Email");
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("prioritizes error over hint when both provided", () => {
    render(
      <Field label="Email" hint="Ingrese su email" error="Email inválido">
        <Input type="email" />
      </Field>
    );

    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    expect(screen.queryByText("Ingrese su email")).not.toBeInTheDocument();
  });

  it("generates stable ID for label-input association", () => {
    const { rerender } = render(
      <Field label="Name">
        <Input />
      </Field>
    );

    const input1 = screen.getByLabelText(/name/i);
    const id1 = input1.id;
    const label1 = document.querySelector(`label[for="${id1}"]`);
    expect(label1).toHaveAttribute("for", id1);

    rerender(
      <Field label="Name">
        <Input />
      </Field>
    );

    const input2 = screen.getByLabelText(/name/i);
    // useId generates stable IDs across re-renders
    expect(input2.id).toBe(id1);
    const label2 = document.querySelector(`label[for="${id1}"]`);
    expect(label2).toHaveAttribute("for", id1);
  });

  it("uses provided id instead of generating one", () => {
    render(
      <Field label="Name" id="custom-name">
        <Input />
      </Field>
    );

    const input = screen.getByLabelText("Name");
    expect(input.id).toBe("custom-name");
  });

  it("forwards className to wrapper", () => {
    render(
      <Field label="Name" className="custom-field">
        <Input />
      </Field>
    );

    expect(screen.getByLabelText("Name").closest(".custom-field")).toBeInTheDocument();
  });

  it("applies proper structure with flex-col gap-1", () => {
    render(
      <Field label="Name">
        <Input />
      </Field>
    );

    const wrapper = screen.getByLabelText("Name").parentElement;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("gap-1");
  });

  it("works with Select component", () => {
    render(
      <Field label="Categoría">
        <select>
          <option value="">Seleccionar…</option>
          <option value="a">Opción A</option>
        </select>
      </Field>
    );

    expect(screen.getByLabelText("Categoría")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("works with Textarea component", () => {
    render(
      <Field label="Descripción" hint="Opcional">
        <textarea rows={3} />
      </Field>
    );

    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Opcional")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});