import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastProps } from "./Toast";

interface ToastItem extends Omit<ToastProps, "children" | "duration"> {
  id: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, "id" | "onClose">) => () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

// Feature flag check (evaluated at build time)
const isToastEnabled = import.meta.env.VITE_TOAST === 'true';

// Noop toast functions for when feature flag is disabled
const noopToast: ToastContextValue = {
  toast: () => () => {},
  dismiss: () => {},
  dismissAll: () => {},
};

export function ToastProvider({ children }: { children: ReactNode }) {
  // If toast is disabled via feature flag, render children without provider
  if (!isToastEnabled) {
    return <>{children}</>;
  }

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "toast-portal";
    container.setAttribute("data-testid", "toast-container");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-label", "Notifications");
    container.style.cssText = `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    };
  }, []);

  const addToast = useCallback(
    (options: Omit<ToastItem, "id" | "onClose">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = options.duration ?? DEFAULT_DURATION;

      const newToast: ToastItem = {
        ...options,
        id,
        duration,
        onClose: () => dismiss(id),
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Keep only MAX_TOASTS
        return updated.slice(-MAX_TOASTS);
      });

      return () => dismiss(id);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    toast: addToast,
    dismiss,
    dismissAll,
  };

  // Render toasts in portal
  const toastElements = toasts.map((t) => (
    <Toast
      key={t.id}
      title={t.title}
      description={t.description}
      variant={t.variant}
      action={t.action}
      onClose={t.onClose}
      duration={t.duration}
      className="toast-item"
    />
  ));

  return (
    <>
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {containerRef.current && createPortal(<div className="toast-stack" style={{ pointerEvents: "auto" }}>{toastElements}</div>, containerRef.current)}
    </>
  );
}

export function useToast() {
  // If toast is disabled via feature flag, return noop functions
  if (!isToastEnabled) {
    return noopToast;
  }

  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Export noop versions for feature flag disabled
export { noopToast };