import React, { useState, useRef, useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip position types
 * @typedef {"top" | "bottom" | "left" | "right"} TooltipPosition
 */

/**
 * Tooltip component props
 * @interface TooltipProps
 * @property {string} content - Tooltip content
 * @property {ReactElement} children - Single child element to attach tooltip to
 * @property {TooltipPosition} [position="top"] - Tooltip position
 * @property {number} [delay=200] - Show/hide delay in ms
 */
interface TooltipProps {
  content: string;
  children: ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

/**
 * Tooltip - A floating tooltip component with hover/focus triggers
 *
 * Shows on hover or focus of the child element. Supports four positions
 * and configurable delay. Uses portal for proper stacking context.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete this item" position="top">
 *   <IconButton aria-label="Delete" icon={<TrashIcon />} />
 * </Tooltip>
 * <Tooltip content="Edit settings" position="right" delay={300}>
 *   <Button variant="ghost">Settings</Button>
 * </Tooltip>
 * ```
 *
 * @component
 * @category Primitives
 */
export function Tooltip({ content, children, position = "top", delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const childRef = useRef<HTMLElement>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") hide();
  };

  const enhancedChildren = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      children.props.onBlur?.(e);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      handleKeyDown(e);
      children.props.onKeyDown?.(e);
    },
    "aria-describedby": isVisible ? "tooltip-content" : undefined,
  });

  const tooltipContent = isVisible ? (
    <div
      id="tooltip-content"
      role="tooltip"
      className={`tooltip tooltip-${position} absolute z-[var(--z-tooltip)] px-2 py-1 text-xs text-white bg-text rounded shadow-lg whitespace-nowrap animate-fade-in`}
      style={getPositionStyle(position)}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      {enhancedChildren}
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}

function getPositionStyle(position: TooltipPosition): React.CSSProperties {
  const styles: Record<TooltipPosition, React.CSSProperties> = {
    top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "4px" },
    bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "4px" },
    left: { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: "4px" },
    right: { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: "4px" },
  };
  return styles[position];
}