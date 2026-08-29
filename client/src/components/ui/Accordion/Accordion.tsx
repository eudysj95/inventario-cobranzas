import React, { createContext, useContext, useState, forwardRef, type ReactNode, type HTMLAttributes } from "react";

interface AccordionContextType {
  openValues: string[];
  setOpenValues: (values: string[]) => void;
  type: "single" | "multiple";
  disabledValues: Set<string>;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion compounds must be used within an Accordion component");
  }
  return context;
}

interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
}

export function Accordion({
  children,
  type = "single",
  defaultValue = [],
  value: controlledValue,
  onChange,
  className = "",
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue].filter(Boolean)
  );
  const isControlled = controlledValue !== undefined;
  const openValues = isControlled
    ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue].filter(Boolean))
    : uncontrolledValue;

  const setOpenValues = (newValues: string[]) => {
    if (!isControlled) setUncontrolledValue(newValues);
    onChange?.(type === "single" ? newValues[0] : newValues);
  };

  const disabledValues = new Set<string>();

  return (
    <AccordionContext.Provider value={{ openValues, setOpenValues, type, disabledValues }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, children, className = "", ...props }, ref) => {
    const { openValues, setOpenValues, type, disabledValues } = useAccordionContext();
    const isOpen = openValues.includes(value);
    const isDisabled = disabled || disabledValues.has(value);

    const toggle = () => {
      if (isDisabled) return;
      if (type === "single") {
        setOpenValues(isOpen ? [] : [value]);
      } else {
        setOpenValues(isOpen ? openValues.filter(v => v !== value) : [...openValues, value]);
      }
    };

    return (
      <div ref={ref} className={`border border-border rounded-lg overflow-hidden ${className}`} {...props}>
        <button
          type="button"
          className="w-full px-4 py-3 text-left font-medium flex items-center justify-between gap-2"
          onClick={toggle}
          disabled={isDisabled}
          aria-expanded={isOpen}
          aria-controls={`${value}-content`}
          id={`${value}-trigger`}
        >
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === AccordionTrigger) {
              return React.cloneElement(child, { children: child.props.children });
            }
            return child;
          })}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div
          id={`${value}-content`}
          role="region"
          aria-labelledby={`${value}-trigger`}
          className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"}`}
          hidden={!isOpen}
        >
          <div className="px-4">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type === AccordionContent) {
                return React.cloneElement(child, { children: child.props.children });
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }
);

AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const AccordionTrigger = ({ children }: AccordionTriggerProps) => {
  // This is a marker component - actual rendering is done by AccordionItem
  return <>{children}</>;
};

AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AccordionContent = ({ children }: AccordionContentProps) => {
  // This is a marker component - actual rendering is done by AccordionItem
  return <>{children}</>;
};

AccordionContent.displayName = "AccordionContent";