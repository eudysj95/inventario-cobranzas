import React, { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * IconButton variant types
 * @typedef {"primary" | "secondary" | "danger" | "ghost"} IconButtonVariant
 */

/**
 * IconButton size types
 * @typedef {"sm" | "md" | "lg"} IconButtonSize
 */

/**
 * IconButton component props
 * @interface IconButtonProps
 * @property {React.ReactNode} icon - Icon element to display
 * @property {string} aria-label - Accessible label (required for accessibility)
 * @property {string} [aria-labelledby] - ID of element that labels the button
 * @property {IconButtonVariant} [variant="ghost"] - Visual style variant
 * @property {IconButtonSize} [size="md"] - Button size
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {boolean} [loading=false] - Whether the button shows loading state
 * @property {boolean} [round=false] - Whether the button is fully rounded
 * @property {ButtonHTMLAttributes<HTMLButtonElement>} - All other button attributes
 */
interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "children"> {
  icon: React.ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  round?: boolean;
}

/**
 * IconButton - A button that displays only an icon, with proper accessibility
 *
 * @example
 * ```tsx
 * <IconButton
 *   aria-label="Delete item"
 *   icon={<TrashIcon />}
 *   variant="danger"
 *   onClick={handleDelete}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <IconButton
 *   aria-label="Close modal"
 *   icon={<XIcon />}
 *   variant="ghost"
 *   round
 *   onClick={handleClose}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      variant = "ghost",
      size = "md",
      disabled = false,
      loading = false,
      round = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabledOrLoading = disabled || loading;

    const classNames = [
      "btn",
      `btn-${variant}`,
      size !== "md" && `btn-${size}`,
      round && "rounded-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={isDisabledOrLoading}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={isDisabledOrLoading || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabledOrLoading ? -1 : undefined}
        {...props}
      >
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";