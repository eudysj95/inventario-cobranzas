import React, { useState, useRef, useEffect, useLayoutEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

/**
 * Dropdown item types
 * @interface DropdownItem
 * @property {string} label - Display label
 * @property {string} value - Item value
 * @property {boolean} [disabled] - Whether item is disabled
 * @property {ReactNode} [icon] - Optional icon
 * @property {"divider"} [type] - Divider type
 */

/**
 * Dropdown component props
 * @interface DropdownProps
 * @property {ReactElement} trigger - Trigger element (button, etc.)
 * @property {DropdownItem[]} items - Menu items
 * @property {(item: DropdownItem) => void} [onSelect] - Selection callback
 * @property {"top" | "bottom"} [position="bottom"] - Menu position
 */
interface DropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "divider";
}

interface DropdownProps {
  trigger: ReactElement;
  items: DropdownItem[];
  onSelect?: (item: DropdownItem) => void;
  position?: "top" | "bottom";
}

/**
 * Dropdown - An accessible dropdown menu component
 *
 * Wraps a trigger element and shows a menu on click. Supports keyboard navigation,
 * dividers, disabled items, and outside-click dismissal.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button variant="ghost">Actions</Button>}
 *   items={[
 *     { label: "Edit", value: "edit", icon: <EditIcon /> },
 *     { label: "Duplicate", value: "duplicate" },
 *     { type: "divider" },
 *     { label: "Delete", value: "delete", disabled: true },
 *   ]}
 *   onSelect={handleSelect}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export function Dropdown({ trigger, items, onSelect, position = "bottom" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  // Position the dropdown relative to trigger when portaled to body
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = position === "top" ? triggerRect.top - dropdownRect.height - 8 : triggerRect.bottom + 8;
    let left = triggerRect.left;

    // Horizontal viewport containment
    if (left + dropdownRect.width > viewportWidth - 16) {
      left = viewportWidth - dropdownRect.width - 16;
    }
    if (left < 16) left = 16;

    // Vertical viewport containment (flip if needed)
    if (position === "bottom" && top + dropdownRect.height > viewportHeight - 16) {
      top = triggerRect.top - dropdownRect.height - 8;
    } else if (position === "top" && top < 16) {
      top = triggerRect.bottom + 8;
    }

    setMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${Math.max(triggerRect.width, 160)}px`,
      zIndex: "var(--z-dropdown)",
    });
  }, [isOpen, position]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle window resize/scroll to reposition
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (triggerRef.current && dropdownRef.current) {
        // Re-trigger positioning by toggling a dummy state
        setMenuStyle((prev) => ({ ...prev }));
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  const enhancedTrigger = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle();
      trigger.props.onClick?.(e);
    },
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
  });

  const menuContent = isOpen ? (
    <div
      ref={dropdownRef}
      role="menu"
      className="popover"
      style={menuStyle}
    >
      <div className="bg-surface border border-border rounded-lg shadow-lg py-1">
        {items.map((item, index) => {
          if (item.type === "divider") {
            return <hr key={`divider-${index}`} className="border-border my-1" role="separator" />;
          }
          return (
            <button
              key={item.value}
              role="menuitem"
              tabIndex={-1}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-surface-hover"
              }`}
              onClick={(e) => {
                if (!item.disabled) {
                  onSelect?.(item);
                  close();
                }
              }}
              disabled={item.disabled}
              aria-disabled={item.disabled}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative inline-block">
      {enhancedTrigger}
      {menuContent && createPortal(menuContent, document.body)}
    </div>
  );
}