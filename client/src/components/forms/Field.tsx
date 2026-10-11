import React, { ReactNode, useId } from "react";
import "./Field.css";

interface FieldProps {
  children: ReactNode;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

/**
 * Field - A wrapper for form fields providing consistent label, hint, error display, and accessibility
 *
 * Features:
 * - Label with required indicator
 * - Hint text (hidden when error is present)
 * - Error message with aria-live="assertive" via role="alert"
 * - Automatic ID generation for label-input association
 * - aria-describedby linking input to hint/error
 * - aria-invalid on error
 *
 * @example
 * ```tsx
 * <Field label="Email" required hint="We'll never share your email" error={errors.email}>
 *   <Input type="email" {...register("email")} />
 * </Field>
 * ```
 */
export function Field({
  children,
  label,
  hint,
  error,
  required = false,
  id: providedId,
  className = "",
}: FieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Clone the child to inject accessibility attributes
  const childWithAria = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? "true" : "false",
        "aria-errormessage": errorId,
        id, // Use Field's ID to match label's htmlFor
      })
    : children;

  return (
    <div className={`field ${className}`} data-testid="field">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="field-required" aria-hidden="true">*</span>}
        </label>
      )}
      {childWithAria}
      {hint && !error && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}