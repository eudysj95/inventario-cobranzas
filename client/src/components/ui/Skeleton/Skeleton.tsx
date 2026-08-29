import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Skeleton variant types
 * @typedef {"text" | "circular" | "rectangular"} SkeletonVariant
 */

/**
 * Skeleton component props
 * @interface SkeletonProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {SkeletonVariant} [variant="rectangular"] - Skeleton shape variant
 * @property {string} [width] - Custom width
 * @property {string} [height] - Custom height
 */
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

/**
 * Skeleton - A placeholder component for loading states
 *
 * Displays a shimmering placeholder while content loads.
 * Supports text lines, circular (avatars), and rectangular (cards) variants.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="60%" />
 * <Skeleton variant="circular" width="40px" height="40px" />
 * <Skeleton variant="rectangular" height="200px" />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "rectangular", width, height, className = "", ...props }, ref) => {
    const variantClasses = {
      text: "h-4 rounded",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
      <div
        ref={ref}
        data-testid="skeleton"
        className={`animate-pulse bg-surface-hover ${variantClasses[variant]} ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";