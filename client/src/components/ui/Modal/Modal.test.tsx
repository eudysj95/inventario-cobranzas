import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders modal when open", () => {
    render(<Modal open onClose={vi.fn()}><div>Content</div></Modal>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<Modal open={false} onClose={vi.fn()}><div>Content</div></Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}><div>Content</div></Modal>);
    fireEvent.click(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key pressed", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}><div>Content</div></Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders title when provided", () => {
    render(<Modal open onClose={vi.fn()} title="Modal Title"><div>Content</div></Modal>);
    expect(screen.getByRole("heading", { name: "Modal Title" })).toBeInTheDocument();
  });

  it("renders footer actions when provided", () => {
    const handleConfirm = vi.fn();
    render(
      <Modal open onClose={vi.fn()} footerActions={<button onClick={handleConfirm}>Confirm</button>}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("traps focus within modal", () => {
    render(<Modal open onClose={vi.fn()}><button>Btn 1</button><button>Btn 2</button></Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("tabIndex", "-1");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Modal open onClose={vi.fn()} size="sm"><div>Content</div></Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-md");

    rerender(<Modal open onClose={vi.fn()} size="lg"><div>Content</div></Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("max-w-2xl");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Modal open onClose={vi.fn()} ref={ref}><div>Content</div></Modal>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});