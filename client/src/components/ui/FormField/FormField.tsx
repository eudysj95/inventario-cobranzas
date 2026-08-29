import React, { useId } from "react";

/**
 * FormField component props
 * @interface FormFieldProps
 * @property {React.ReactNode} children - Form input element (Input, Select, Textarea, etc.)
 * @property {string} [label] - Label text for the field
 * @property {string} [hint] - Helper text displayed below the field
 * @property {string} [error] - Error message displayed below the field
 * @property {boolean} [required=false] - Whether the field is required (shows asterisk)
 * @property {string} [id] - Unique identifier for the field (used for label association)
 * @property {string} [className] - Additional CSS classes for the wrapper
 */
interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

/**
 * FormField - A wrapper component for consistent form field layout
 *
 * Provides standardized spacing, label association, hint/error display,
 * and accessibility attributes. Works with any form input component.
 *
 * @example
 * ```tsx
 * <FormField label="Email" required hint="We'll never share your email" error={errors.email}>
 *   <Input type="email" placeholder="you@example.com" />
 * </FormField>
 * ```
 *
 * @component
 * @category Primitives
 */
export function FormField({
  children,
  label,
  hint,
  error,
  required = false,
  id: providedId,
  className = "",
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Clone the child to inject aria-describedby and ensure ID matches label's htmlFor
  const childWithAria = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? "true" : "false",
        "aria-errormessage": errorId,
        id, // Always use FormField's ID to match label's htmlFor
      })
    : children;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {childWithAria}
      {hint && !error && <p id={hintId} className="form-hint">{hint}</p>}
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
    </div>
  );
}