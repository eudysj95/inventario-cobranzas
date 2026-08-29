import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";

describe("Card", () => {
  it("renders card with children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
    expect(screen.getByText("Card content").closest(".card")).toBeInTheDocument();
  });

  it("renders card header", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    );
    expect(screen.getByText("Header").closest(".card-header")).toBeInTheDocument();
  });

  it("renders card body", () => {
    render(
      <Card>
        <CardBody>Body content</CardBody>
      </Card>
    );
    expect(screen.getByText("Body content").closest(".card-body")).toBeInTheDocument();
  });

  it("renders card footer", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Footer").closest(".card-footer")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Card className="custom-card">Content</Card>);
    expect(screen.getByText("Content").closest(".custom-card")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});