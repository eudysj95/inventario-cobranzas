import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormLayout } from "./FormLayout";

describe("FormLayout", () => {
  it("renders sidebar and panel children", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar>Sidebar Content</FormLayout.Sidebar>
        <FormLayout.Panel>Panel Content</FormLayout.Panel>
      </FormLayout>
    );

    expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
    expect(screen.getByText("Panel Content")).toBeInTheDocument();
  });

  it("applies desktop layout classes", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar>Sidebar</FormLayout.Sidebar>
        <FormLayout.Panel>Panel</FormLayout.Panel>
      </FormLayout>
    );

    const container = screen.getByTestId("form-layout");
    expect(container).toHaveClass("form-layout");
    expect(screen.getByTestId("form-layout-sidebar")).toHaveClass("form-layout-sidebar");
    expect(screen.getByTestId("form-layout-panel")).toHaveClass("form-layout-panel");
  });

  it("renders only sidebar when panel is not provided", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar>Sidebar Only</FormLayout.Sidebar>
      </FormLayout>
    );

    expect(screen.getByText("Sidebar Only")).toBeInTheDocument();
    expect(screen.queryByTestId("form-layout-panel")).not.toBeInTheDocument();
  });

  it("renders only panel when sidebar is not provided", () => {
    render(
      <FormLayout>
        <FormLayout.Panel>Panel Only</FormLayout.Panel>
      </FormLayout>
    );

    expect(screen.getByText("Panel Only")).toBeInTheDocument();
    expect(screen.queryByTestId("form-layout-sidebar")).not.toBeInTheDocument();
  });

  it("forwards custom className to root element", () => {
    render(
      <FormLayout className="custom-class">
        <FormLayout.Sidebar>Sidebar</FormLayout.Sidebar>
        <FormLayout.Panel>Panel</FormLayout.Panel>
      </FormLayout>
    );

    expect(screen.getByTestId("form-layout")).toHaveClass("custom-class");
  });

  it("forwards custom className to sidebar", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar className="custom-sidebar">Sidebar</FormLayout.Sidebar>
        <FormLayout.Panel>Panel</FormLayout.Panel>
      </FormLayout>
    );

    expect(screen.getByTestId("form-layout-sidebar")).toHaveClass("custom-sidebar");
  });

  it("forwards custom className to panel", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar>Sidebar</FormLayout.Sidebar>
        <FormLayout.Panel className="custom-panel">Panel</FormLayout.Panel>
      </FormLayout>
    );

    expect(screen.getByTestId("form-layout-panel")).toHaveClass("custom-panel");
  });

  it("has proper semantic structure with aside and section", () => {
    render(
      <FormLayout>
        <FormLayout.Sidebar>Sidebar</FormLayout.Sidebar>
        <FormLayout.Panel>Panel</FormLayout.Panel>
      </FormLayout>
    );

    const sidebar = screen.getByTestId("form-layout-sidebar");
    const panel = screen.getByTestId("form-layout-panel");

    expect(sidebar.tagName).toBe("ASIDE");
    expect(panel.tagName).toBe("SECTION");
    expect(sidebar).toHaveAttribute("role", "complementary");
    expect(panel).toHaveAttribute("role", "region");
  });
});