import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * ButtonGroup component props
 * @interface ButtonGroupProps
 * @property {React.ReactNode} children - Button components to group
 * @property {boolean} [vertical=false] - Whether to stack buttons vertically
 * @property {string} [aria-label] - Accessible label for the group (recommended)
 * @property {string} [aria-labelledby] - ID of element that labels the group
 * @property {HTMLAttributes<HTMLDivElement>} - All other div attributes
 */
interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  vertical?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * ButtonGroup - A container for grouping related buttons together
 *
 * Provides proper accessibility semantics with role="group" and
 * optional accessible label. Uses flexbox for layout.
 *
 * @example
 * ```tsx
 * <ButtonGroup aria-label="Text formatting">
 *   <Button variant="ghost"><BoldIcon /></Button>
 *   <Button variant="ghost"><ItalicIcon /></Button>
 *   <Button variant="ghost"><UnderlineIcon /></Button>
 * </ButtonGroup>
 * ```
 *
 * @example
 * ```tsx
 * <ButtonGroup vertical aria-label="Navigation">
 *   <Button>Previous</Button>
 *   <Button>Next</Button>
 * </ButtonGroup>
 * ```
 *
 * @component
 * @category Primitives
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, vertical = false, className = "", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={`flex ${vertical ? "flex-col" : ""} gap-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";