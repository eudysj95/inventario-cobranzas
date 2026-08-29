import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabList, Tab, TabPanel } from "./Tabs";

describe("Tabs", () => {
  it("renders tabs with panels", () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
      </Tabs>
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab 1", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab 2", selected: false })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
  });

  it("switches tabs on click", () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
      </Tabs>
    );
    fireEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
    expect(screen.getByRole("tab", { name: "Tab 1", selected: false })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab 2", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
  });

  it("handles controlled mode", () => {
    const { rerender } = render(
      <Tabs index={0} onChange={vi.fn()}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "Tab 1", selected: true })).toBeInTheDocument();

    rerender(
      <Tabs index={1} onChange={vi.fn()}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "Tab 2", selected: true })).toBeInTheDocument();
  });

  it("handles keyboard navigation", () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
      </Tabs>
    );
    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    tab1.focus();
    fireEvent.keyDown(tab1, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Tab 2", selected: true })).toBeInTheDocument();
  });

  it("disables tab when disabled prop is true", () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab disabled>Tab 2</Tab>
        </TabList>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
      </Tabs>
    );
    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    expect(tab2).toHaveAttribute("aria-disabled", "true");
  });
});