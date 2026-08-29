import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Chip variant types
 * @typedef {"primary" | "success" | "warning" | "danger" | "info" | "neutral"} ChipVariant
 */

/**
 * Chip size types
 * @typedef {"sm" | "md"} ChipSize
 */

/**
 * Chip component props
 * @interface ChipProps
 * @extends HTMLAttributes<HTMLSpanElement>
 * @property {string} label - Chip text content
 * @property {ChipVariant} [variant="neutral"] - Visual style variant
 * @property {ChipSize} [size="md"] - Chip size
 * @property {() => void} [onRemove] - Callback when remove button clicked (shows remove button)
 * @property {boolean} [disabled=false] - Whether the chip is disabled
 */
interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  onRemove?: () => void;
  disabled?: boolean;
}

/**
 * Chip - An interactive tag/filter component wrapping the .chip utility classes
 *
 * Can be used as a removable tag, filter, or category label.
 * Shows a remove button when onRemove callback is provided.
 *
 * @example
 * ```tsx
 * <Chip label="React" variant="primary" onRemove={handleRemove} />
 * <Chip label="TypeScript" variant="info" />
 * <Chip label="Design" variant="success" size="sm" />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ label, variant = "neutral", size = "md", onRemove, disabled = false, className = "", ...props }, ref) => {
    const classNames = [
      "chip",
      `chip-${variant}`,
      size === "sm" && "chip-sm",
      onRemove && "flex items-center gap-1",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classNames} {...props}>
        {label}
        {onRemove && (
          <button
            type="button"
            className="p-0.5 rounded hover:bg-black/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label}`}
            tabIndex={disabled ? -1 : 0}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = "Chip";