import React, { forwardRef, useId, type TextareaHTMLAttributes } from "react";

/**
 * Textarea component props
 * @interface TextareaProps
 * @extends TextareaHTMLAttributes<HTMLTextAreaElement>
 * @property {string} [label] - Label text for the textarea
 * @property {string} [hint] - Helper text displayed below the textarea
 * @property {string} [error] - Error message displayed below the textarea (sets aria-invalid)
 * @property {string} [id] - Unique identifier (auto-generated if not provided)
 */
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

/**
 * Textarea - A styled multi-line text input component wrapping the .textarea utility class
 *
 * Supports label, hint, error states, and full accessibility attributes.
 * Automatically generates unique IDs for association with label/hint/error.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   rows={4}
 *   placeholder="Enter product description"
 *   hint="Max 500 characters"
 *   error={errors.description?.message}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={id}
          className={`textarea ${className}`}
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

Textarea.displayName = "Textarea";