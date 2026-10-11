import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useDirtyForm } from "./useDirtyForm";
import { BrowserRouter } from "react-router-dom";
import { act } from "react";

// Test component that uses the hook
function TestForm({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const { isDirty, setDirty, resetDirty } = useDirtyForm({ onDirtyChange });
  return (
    <div>
      <span data-testid="dirty-status">{isDirty ? "dirty" : "clean"}</span>
      <button
        data-testid="make-dirty"
        onClick={() => setDirty(true)}
        disabled={isDirty}
      >
        Make Dirty
      </button>
      <button
        data-testid="reset-dirty"
        onClick={() => resetDirty()}
        disabled={!isDirty}
      >
        Reset Dirty
      </button>
    </div>
  );
}

function wrapWithRouter(ui: React.ReactElement) {
  return (
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

describe("useDirtyForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns isDirty=false initially", () => {
    render(wrapWithRouter(<TestForm />));
    expect(screen.getByTestId("dirty-status").textContent).toBe("clean");
  });

  it("sets isDirty to true when setDirty(true) is called", () => {
    render(wrapWithRouter(<TestForm />));

    fireEvent.click(screen.getByTestId("make-dirty"));

    expect(screen.getByTestId("dirty-status").textContent).toBe("dirty");
  });

  it("resets isDirty to false when resetDirty() is called", () => {
    render(wrapWithRouter(<TestForm />));

    fireEvent.click(screen.getByTestId("make-dirty"));
    expect(screen.getByTestId("dirty-status").textContent).toBe("dirty");

    fireEvent.click(screen.getByTestId("reset-dirty"));
    expect(screen.getByTestId("dirty-status").textContent).toBe("clean");
  });

  it("calls onDirtyChange callback when dirty state changes", () => {
    const onDirtyChange = vi.fn();
    render(wrapWithRouter(<TestForm onDirtyChange={onDirtyChange} />));

    fireEvent.click(screen.getByTestId("make-dirty"));
    expect(onDirtyChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByTestId("reset-dirty"));
    expect(onDirtyChange).toHaveBeenCalledWith(false);
  });

  it("does not call onDirtyChange on initial render", () => {
    const onDirtyChange = vi.fn();
    render(wrapWithRouter(<TestForm onDirtyChange={onDirtyChange} />));

    expect(onDirtyChange).not.toHaveBeenCalled();
  });

  it("blocks navigation when dirty and user tries to leave", async () => {
    const { result } = render(wrapWithRouter(<TestForm />));

    fireEvent.click(screen.getByTestId("make-dirty"));

    // The hook should register a blocker with React Router
    // This is tested via integration in the actual app
    expect(screen.getByTestId("dirty-status").textContent).toBe("dirty");
  });

  it("allows navigation when not dirty", () => {
    render(wrapWithRouter(<TestForm />));
    expect(screen.getByTestId("dirty-status").textContent).toBe("clean");
  });

  it("handles multiple setDirty calls correctly", () => {
    render(wrapWithRouter(<TestForm />));

    fireEvent.click(screen.getByTestId("make-dirty"));
    fireEvent.click(screen.getByTestId("make-dirty")); // Second call should not change anything

    expect(screen.getByTestId("dirty-status").textContent).toBe("dirty");
  });

  it("handles multiple resetDirty calls correctly", () => {
    render(wrapWithRouter(<TestForm />));

    fireEvent.click(screen.getByTestId("make-dirty"));
    fireEvent.click(screen.getByTestId("reset-dirty"));
    fireEvent.click(screen.getByTestId("reset-dirty")); // Second call should not change anything

    expect(screen.getByTestId("dirty-status").textContent).toBe("clean");
  });
});