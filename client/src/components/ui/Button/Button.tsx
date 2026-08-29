import React, { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

/**
 * Button variant types
 * @typedef {"primary" | "secondary" | "danger" | "ghost" | "success"} ButtonVariant
 */

/**
 * Button size types
 * @typedef {"sm" | "md" | "lg"} ButtonSize
 */

/**
 * Base button props shared between button and anchor elements
 * @interface BaseButtonProps
 * @property {ButtonVariant} [variant="primary"] - Visual style variant
 * @property {ButtonSize} [size="md"] - Button size
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {boolean} [loading=false] - Whether the button shows loading state
 * @property {boolean} [fullWidth=false] - Whether the button takes full width
 * @property {React.ReactNode} children - Button content
 */

/**
 * Button component props when rendered as a button element
 * @interface ButtonProps
 * @extends BaseButtonProps
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 * @property {string} [href] - If provided, renders as anchor element
 */

/**
 * Button component props when rendered as an anchor element
 * @interface AnchorButtonProps
 * @extends BaseButtonProps
 * @extends AnchorHTMLAttributes<HTMLAnchorElement>
 * @property {string} href - Required when rendering as anchor
 * @property {undefined} onClick - onClick not allowed for anchor (use href)
 */

type BaseButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
};

type ButtonProps = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
    href?: never;
    ref?: React.Ref<HTMLButtonElement>;
  };

type AnchorButtonProps = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled"> & {
    href: string;
    ref?: React.Ref<HTMLAnchorElement>;
    onClick?: never;
  };

type Props = ButtonProps | AnchorButtonProps;

/**
 * Button - A versatile button component wrapping the .btn utility classes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * <Button href="/login" variant="ghost">
 *   Sign in
 * </Button>
 * ```
 *
 * @component
 * @category Primitives
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  (
    {
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      children,
      href,
      className = "",
      ...props
    },
    ref
  ) => {
    const isAnchor = !!href;
    const isDisabledOrLoading = disabled || loading;

    const classNames = [
      "btn",
      `btn-${variant}`,
      size !== "md" && `btn-${size}`,
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const commonProps = {
      ref,
      className: classNames,
      "aria-disabled": isDisabledOrLoading || undefined,
      "aria-busy": loading || undefined,
      ...(isDisabledOrLoading ? { tabIndex: -1 } : {}),
    };

    if (isAnchor) {
      return (
        <a
          {...commonProps}
          href={href}
          {...(props as AnchorButtonProps)}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (isDisabledOrLoading) {
              e.preventDefault();
            }
          }}
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          {children}
        </a>
      );
    }

    return (
      <button
        {...commonProps}
        type="button"
        disabled={isDisabledOrLoading}
        {...(props as ButtonProps)}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";