import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Divider orientation types
 * @typedef {"horizontal" | "vertical"} DividerOrientation
 */

/**
 * Divider component props
 * @interface DividerProps
 * @extends HTMLAttributes<HTMLHRElement>
 * @property {DividerOrientation} [orientation="horizontal"] - Divider orientation
 * @property {React.ReactNode} [children] - Optional label text
 */
interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

/**
 * Divider - A visual separator component with optional label
 *
 * Renders as an <hr> element for semantic correctness and accessibility.
 * Supports horizontal (default) and vertical orientations with optional label.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider>Section Title</Divider>
 * <Divider orientation="vertical" className="h-8" />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", children, className = "", ...props }, ref) => {
    const isHorizontal = orientation === "horizontal";

    const classNames = [
      "border-border",
      isHorizontal ? "w-full my-2" : "h-full mx-2",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (children && isHorizontal) {
      return (
        <div className="flex items-center gap-2 w-full" role="separator" aria-orientation="horizontal">
          <hr className="flex-1 border-border" ref={ref} {...props} />
          <span className="text-xs text-text-secondary font-medium px-2 whitespace-nowrap">{children}</span>
          <hr className="flex-1 border-border" {...props} />
        </div>
      );
    }

    if (children && !isHorizontal) {
      return (
        <div className="flex items-center gap-2 h-full" role="separator" aria-orientation="vertical">
          <hr className="flex-1 border-border" ref={ref} {...props} />
          <span className="text-xs text-text-secondary font-medium py-2 whitespace-nowrap writing-mode-vertical-lr">{children}</span>
          <hr className="flex-1 border-border" {...props} />
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={classNames}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";