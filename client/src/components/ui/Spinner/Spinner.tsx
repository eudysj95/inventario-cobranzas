import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Spinner size types
 * @typedef {"sm" | "md" | "lg"} SpinnerSize
 */

/**
 * Spinner variant types
 * @typedef {"primary" | "white"} SpinnerVariant
 */

/**
 * Spinner component props
 * @interface SpinnerProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {SpinnerSize} [size="md"] - Spinner size
 * @property {SpinnerVariant} [variant="primary"] - Spinner color variant
 * @property {string} [label="Loading..."] - Accessible label
 */
interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
  label?: string;
}

/**
 * Spinner - A loading spinner component
 *
 * Displays an animated circular spinner for loading states.
 * Supports multiple sizes and color variants.
 *
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" label="Loading data" />
 * <Spinner size="sm" /> // Inline in buttons
 * <Spinner size="lg" variant="white" /> // On dark backgrounds
 * ```
 *
 * @component
 * @category Primitives
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", variant = "primary", label = "Loading...", className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4 border-[2px]",
      md: "w-6 h-6 border-[2px]",
      lg: "w-8 h-8 border-[3px]",
    };

    const variantClasses = {
      primary: "border-border border-t-primary",
      white: "border-white/30 border-t-white",
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={`flex items-center justify-center ${className}`}
        {...props}
      >
        <svg
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";