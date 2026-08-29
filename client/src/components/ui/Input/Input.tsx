import React, { forwardRef, useId, type InputHTMLAttributes } from "react";

/**
 * Input component props
 * @interface InputProps
 * @extends InputHTMLAttributes<HTMLInputElement>
 * @property {string} [label] - Label text for the input
 * @property {string} [hint] - Helper text displayed below the input
 * @property {string} [error] - Error message displayed below the input (sets aria-invalid)
 * @property {string} [id] - Unique identifier (auto-generated if not provided)
 */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

/**
 * Input - A styled text input component wrapping the .input utility class
 *
 * Supports label, hint, error states, and full accessibility attributes.
 * Automatically generates unique IDs for association with label/hint/error.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   hint="We'll never share your email"
 *   error={errors.email?.message}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id: providedId, className = "", ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          className={`input ${className}`}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : "false"}
          aria-errormessage={errorId}
          {...props}
        />
        {hint && !error && <p id={hintId} className="form-hint">{hint}</p>}
        {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";