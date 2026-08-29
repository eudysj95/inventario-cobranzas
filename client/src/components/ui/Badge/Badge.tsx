import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Badge variant types
 * @typedef {"primary" | "success" | "warning" | "danger" | "info" | "neutral"} BadgeVariant
 */

/**
 * Badge size types
 * @typedef {"sm" | "md"} BadgeSize
 */

/**
 * Badge component props
 * @interface BadgeProps
 * @extends HTMLAttributes<HTMLSpanElement>
 * @property {BadgeVariant} [variant="neutral"] - Visual style variant
 * @property {BadgeSize} [size="md"] - Badge size
 * @property {boolean} [dot=false] - Whether to show a status dot indicator
 */
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

/**
 * Badge - A small status indicator component wrapping the .chip utility classes
 *
 * Used for labels, status indicators, counts, and categorization.
 * Supports a dot variant for status indicators (online/offline, etc.).
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="danger" dot>Offline</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * ```
 *
 * @component
 * @category Primitives
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "neutral", size = "md", dot = false, className = "", children, ...props }, ref) => {
    const classNames = [
      "chip",
      `chip-${variant}`,
      size === "sm" && "chip-sm",
      dot && "flex items-center gap-1",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classNames} {...props}>
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";