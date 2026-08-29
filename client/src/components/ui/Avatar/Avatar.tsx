import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Avatar size types
 * @typedef {"xs" | "sm" | "md" | "lg" | "xl"} AvatarSize
 */

/**
 * Avatar shape types
 * @typedef {"circle" | "square"} AvatarShape
 */

/**
 * Avatar status types
 * @typedef {"online" | "offline" | "busy" | "away"} AvatarStatus
 */

/**
 * Avatar component props
 * @interface AvatarProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {string} [src] - Image source URL
 * @property {string} [alt] - Alt text for image (required if src provided)
 * @property {string} [name] - Name for generating initials fallback
 * @property {AvatarSize} [size="md"] - Avatar size
 * @property {AvatarShape} [shape="circle"] - Avatar shape
 * @property {AvatarStatus} [status] - Status indicator (online, offline, busy, away)
 */
interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "busy" | "away";
}

/**
 * Avatar - A user profile image component with fallback initials and status indicator
 *
 * Displays an image when src is provided, otherwise generates initials from name.
 * Supports status indicators (online/offline/busy/away) and multiple sizes.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" size="lg" status="online" />
 * <Avatar name="Jane Smith" size="sm" />
 * <Avatar name="Admin" shape="square" size="xl" />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = "md", shape = "circle", status, className = "", children, ...props }, ref) => {
    const sizeClasses = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
    };

    const shapeClasses = {
      circle: "rounded-full",
      square: "rounded-lg",
    };

    const statusColors = {
      online: "bg-success",
      offline: "bg-border-strong",
      busy: "bg-danger",
      away: "bg-warning",
    };

    const getInitials = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = name ? getInitials(name) : "?";

    const statusIndicator = status ? (
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${size === "xs" ? "w-1.5 h-1.5" : ""} ${statusColors[status]} border-2 border-surface rounded-full`}
        aria-label={`Status: ${status}`}
      />
    ) : null;

    return (
      <div
        ref={ref}
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary-light text-primary font-medium ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || name || "Avatar"} className="w-full h-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
        {statusIndicator}
        {children}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";