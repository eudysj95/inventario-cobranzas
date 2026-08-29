import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastProvider";
import { renderHook } from "@testing-library/react";

// Test component that uses useToast
function TestToastConsumer() {
  const { toast, dismiss, dismissAll } = useToast();
  return (
    <div>
      <button
        data-testid="show-success"
        onClick={() => toast({ variant: "success", title: "Success!", description: "Operation completed" })}
      >
        Show Success
      </button>
      <button
        data-testid="show-error"
        onClick={() => toast({ variant: "error", title: "Error!", description: "Something went wrong" })}
      >
        Show Error
      </button>
      <button
        data-testid="show-warning"
        onClick={() => toast({ variant: "warning", title: "Warning!", description: "Be careful" })}
      >
        Show Warning
      </button>
      <button
        data-testid="show-info"
        onClick={() => toast({ variant: "info", title: "Info", description: "Just FYI" })}
      >
        Show Info
      </button>
      <button
        data-testid="show-with-action"
        onClick={() =>
          toast({
            variant: "success",
            title: "Saved",
            description: "Your changes were saved",
            action: { label: "Undo", onClick: vi.fn() },
          })
        }
      >
        Show With Action
      </button>
      <button data-testid="dismiss-all" onClick={dismissAll}>
        Dismiss All
      </button>
    </div>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders ToastProvider without errors", () => {
    render(
      <ToastProvider>
        <div>Test</div>
      </ToastProvider>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders toasts in portal (document.body)", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    // Toast should be rendered in portal (not in the test container)
    const toastContainer = document.body.querySelector('[data-testid="toast-container"]');
    expect(toastContainer).toBeInTheDocument();
  });

  it("shows toast with correct variant classes", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("alert-success");
    expect(toast).toHaveTextContent("Success!");
    expect(toast).toHaveTextContent("Operation completed");
  });

  it("shows error variant with correct class", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-error").click();
    });

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("alert-error");
  });

  it("shows warning variant with correct class", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-warning").click();
    });

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("alert-warning");
  });

  it("shows info variant with correct class", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-info").click();
    });

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("alert-info");
  });

  it("shows action button when provided", () => {
    const actionClick = vi.fn();
    // Need a new test component with the specific action
    function TestActionToast() {
      const { toast } = useToast();
      return (
        <button
          data-testid="show-action"
          onClick={() => toast({ variant: "success", title: "Saved", description: "Your changes were saved", action: { label: "Undo", onClick: actionClick } })}
        >
          Show Action
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestActionToast />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-action").click();
    });

    const actionButton = screen.getByRole("button", { name: "Undo" });
    expect(actionButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(actionButton);
    });
    expect(actionClick).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after default duration (4000ms)", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    expect(screen.getByRole("status")).toBeInTheDocument();

    // Advance timers by 4000ms (default duration)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("pauses auto-dismiss on hover", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    const toast = screen.getByRole("status");

    // Hover over toast
    act(() => {
      fireEvent.mouseEnter(toast);
    });

    // Advance timers past default duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Toast should still be visible
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Leave hover
    act(() => {
      fireEvent.mouseLeave(toast);
    });

    // Advance timers - should dismiss now
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows progress bar during auto-dismiss", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("stacks multiple toasts (max 5)", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    // Add 6 toasts
    for (let i = 0; i < 6; i++) {
      act(() => {
        screen.getByTestId("show-success").click();
      });
    }

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(5); // Max 5 visible
  });

  it("dismisses individual toast via close button", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    expect(screen.getByRole("status")).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses all toasts via dismissAll", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    // Add 3 toasts
    for (let i = 0; i < 3; i++) {
      act(() => {
        screen.getByTestId("show-success").click();
      });
    }

    expect(screen.getAllByRole("status")).toHaveLength(3);

    act(() => {
      screen.getByTestId("dismiss-all").click();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("has accessible attributes: aria-live=polite, role=alert", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("role", "status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
  });

  it("toast container has correct ARIA region", () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId("show-success").click();
    });

    const container = document.body.querySelector('[data-testid="toast-container"]');
    expect(container).toHaveAttribute("aria-live", "polite");
    expect(container).toHaveAttribute("aria-label", "Notifications");
  });
});

describe("useToast hook", () => {
  it("returns toast, dismiss, dismissAll functions", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    expect(typeof result.current.toast).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
    expect(typeof result.current.dismissAll).toBe("function");
  });

  it("toast returns dismiss function for that specific toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ToastProvider,
    });

    const dismissFn = result.current.toast({ variant: "success", title: "Test" });
    expect(typeof dismissFn).toBe("function");
  });
});