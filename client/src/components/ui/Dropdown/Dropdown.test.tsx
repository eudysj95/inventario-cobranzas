import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

describe("Dropdown", () => {
  const items = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  it("renders dropdown trigger", () => {
    render(<Dropdown trigger={<button>Menu</button>} items={items} />);
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("opens menu on trigger click", () => {
    render(<Dropdown trigger={<button>Menu</button>} items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Option 1" })).toBeInTheDocument();
  });

  it("closes menu on item click", () => {
    render(<Dropdown trigger={<button>Menu</button>} items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Option 2" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls onSelect with selected item", () => {
    const onSelect = vi.fn();
    render(<Dropdown trigger={<button>Menu</button>} items={items} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Option 2" }));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it("shows divider when provided", () => {
    const itemsWithDivider = [
      { label: "Option 1", value: "1" },
      { type: "divider" as const },
      { label: "Option 2", value: "2" },
    ];
    render(<Dropdown trigger={<button>Menu</button>} items={itemsWithDivider} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("disables item when disabled prop is true", () => {
    const itemsWithDisabled = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2", disabled: true },
    ];
    render(<Dropdown trigger={<button>Menu</button>} items={itemsWithDisabled} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const disabledItem = screen.getByRole("menuitem", { name: "Option 2" });
    expect(disabledItem).toHaveAttribute("aria-disabled", "true");
  });

  it("closes on Escape key", () => {
    render(<Dropdown trigger={<button>Menu</button>} items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on outside click", () => {
    render(<Dropdown trigger={<button>Menu</button>} items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});