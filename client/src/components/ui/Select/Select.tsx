import React, { forwardRef, useId, type SelectHTMLAttributes } from "react";

/**
 * Select option type
 * @interface SelectOption
 * @property {string} value - Option value
 * @property {string} label - Option display label
 * @property {boolean} [disabled] - Whether the option is disabled
 */
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select component props
 * @interface SelectProps
 * @extends SelectHTMLAttributes<HTMLSelectElement>
 * @property {SelectOption[]} options - Array of options to display
 * @property {string} [label] - Label text for the select
 * @property {string} [hint] - Helper text displayed below the select
 * @property {string} [error] - Error message displayed below the select (sets aria-invalid)
 * @property {string} [placeholder] - Placeholder text for empty state
 * @property {string} [id] - Unique identifier (auto-generated if not provided)
 */
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
  options: SelectOption[];
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  id?: string;
}

/**
 * Select - A styled select dropdown component wrapping the .select utility class
 *
 * Supports label, hint, error states, and full accessibility attributes.
 * Options can be disabled individually.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: "", label: "Select country" },
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" },
 *   ]}
 *   placeholder="Select country"
 *   error={errors.country?.message}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, hint, error, placeholder, id: providedId, className = "", ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="label">
            {label}
            {props.required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`select ${className}`}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : "false"}
          aria-errormessage={errorId}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && <p id={hintId} className="form-hint">{hint}</p>}
        {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";