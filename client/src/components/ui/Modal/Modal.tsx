import React, { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../IconButton";

/**
 * Modal size types
 * @typedef {"sm" | "md" | "lg" | "xl" | "full"} ModalSize
 */

/**
 * Modal component props
 * @interface ModalProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {boolean} open - Whether the modal is open
 * @property {() => void} onClose - Callback when modal should close
 * @property {string} [title] - Modal title (accessible label)
 * @property {ReactNode} [footerActions] - Footer action buttons
 * @property {ModalSize} [size="md"] - Modal size
 * @property {boolean} [closeOnBackdrop=true] - Whether clicking backdrop closes modal
 * @property {boolean} [closeOnEscape=true] - Whether Escape key closes modal
 */
interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  footerActions?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Modal - An accessible dialog component with backdrop, focus trap, and animations
 *
 * Uses portal to render at document root. Implements focus trapping, Escape key handling,
 * backdrop click handling, and proper ARIA attributes for accessibility.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Delete"
 *   footerActions={
 *     <>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </Modal>
 * ```
 *
 * @component
 * @category Primitives
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      footerActions,
      size = "md",
      closeOnBackdrop = true,
      closeOnEscape = true,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Focus trap
    useEffect(() => {
      if (!open) return;

      const modal = modalRef.current;
      if (!modal) return;

      previousActiveElement.current = document.activeElement as HTMLElement;
      modal.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && closeOnEscape) {
          onClose();
        }

        if (e.key === "Tab") {
          const focusableElements = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      };
    }, [open, closeOnEscape, onClose]);

    if (!open) return null;

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-xl",
      xl: "max-w-2xl",
      full: "max-w-4xl",
    };

    const modalContent = (
      <div
        className="modal-backdrop"
        onClick={(e) => {
          if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="presentation"
      >
        <div
          ref={modalRef}
          className={`modal ${sizeClasses[size]} ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          tabIndex={-1}
          {...props}
        >
          {(title || footerActions) && (
            <div className="modal-header">
              {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
              <IconButton
                aria-label="Close"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                }
                variant="ghost"
                size="sm"
                onClick={onClose}
              />
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footerActions && <div className="modal-footer">{footerActions}</div>}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = "Modal";