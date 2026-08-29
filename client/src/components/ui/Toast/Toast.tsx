import React, { forwardRef, type HTMLAttributes, useState, useEffect, useRef } from "react";
import { IconButton } from "../IconButton";

/**
 * Toast variant types
 * @typedef {"success" | "error" | "warning" | "info"} ToastVariant
 */

/**
 * Toast action type
 * @interface ToastAction
 * @property {string} label - Action button label
 * @property {() => void} onClick - Action callback
 */

/**
 * Toast component props
 * @interface ToastProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {string} [title] - Toast title
 * @property {string} [description] - Toast description
 * @property {ToastVariant} [variant="info"] - Toast variant
 * @property {ToastAction} [action] - Optional action button
 * @property {() => void} [onClose] - Close callback
 * @property {number} [duration] - Auto-dismiss duration in ms (0 to disable)
 */
interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  duration?: number;
}

/**
 * Toast - A notification toast component wrapping the .alert utility classes
 *
 * Used for transient notifications with optional action button and close button.
 * Designed to be used with ToastProvider for managed stacking and auto-dismiss.
 * Supports auto-dismiss with progress bar, pause on hover.
 *
 * @example
 * ```tsx
 * <Toast
 *   title="Changes saved"
 *   description="Your changes have been saved successfully"
 *   variant="success"
 *   action={{ label: "Undo", onClick: handleUndo }}
 *   onClose={handleClose}
 *   duration={4000}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = "info", action, onClose, duration = 4000, className = "", ...props }, ref) => {
    const variantClasses = {
      success: "alert-success",
      error: "alert-error",
      warning: "alert-warning",
      info: "alert-info",
    };

    const classNames = ["alert", variantClasses[variant], className].filter(Boolean).join(" ");

    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(100);
    const intervalRef = useRef<number>();
    const startTimeRef = useRef<number>(Date.now());
    const pausedTimeRef = useRef<number>(0);

    // Auto-dismiss with progress bar
    useEffect(() => {
      if (duration <= 0) return;

      const updateProgress = () => {
        if (isHovered) return;

        const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
        const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(newProgress);

        if (newProgress <= 0 && onClose) {
          onClose();
        }
      };

      intervalRef.current = window.setInterval(updateProgress, 50);

      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }, [duration, isHovered, onClose]);

    const handleMouseEnter = () => {
      setIsHovered(true);
      pausedTimeRef.current += Date.now() - startTimeRef.current;
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      startTimeRef.current = Date.now();
    };

    return (
      <div
        ref={ref}
        className={classNames}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", minWidth: "300px", maxWidth: "400px" }}
        {...props}
      >
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
          {!title && !description && <span className="flex-1">{props.children}</span>}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {action && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          )}
          {onClose && (
            <IconButton
              aria-label="Close toast"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              }
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          )}
        </div>
        {duration > 0 && (
          <div
            className="toast-progress"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "3px",
              background: "currentColor",
              opacity: 0.4,
              width: `${progress}%`,
              transition: "width 0.1s linear",
              borderRadius: "0 0 inherit inherit",
            }}
          />
        )}
      </div>
    );
  }
);

Toast.displayName = "Toast";