import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";

describe("Accordion", () => {
  it("renders accordion with items", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    // The trigger is a button with the item text as accessible name
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveTextContent("Item 1");
    // Content region is hidden initially
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("opens item on trigger click", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole("button");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("region")).toHaveTextContent("Content 1");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes item on second click", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    expect(screen.getByRole("region")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("allows multiple open items when type is multiple", () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    // Use partial text match to handle text split by SVG
    fireEvent.click(screen.getByText((content) => content.includes("Item 1")).closest("button"));
    fireEvent.click(screen.getByText((content) => content.includes("Item 2")).closest("button"));
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("closes other items when type is single", () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText((content) => content.includes("Item 1")).closest("button"));
    expect(screen.getAllByRole("region")).toHaveLength(1);

    fireEvent.click(screen.getByText((content) => content.includes("Item 2")).closest("button"));
    expect(screen.getAllByRole("region")).toHaveLength(1);
    expect(screen.getByRole("region")).toHaveTextContent("Content 2");
  });

  it("handles disabled item", () => {
    render(
      <Accordion>
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});