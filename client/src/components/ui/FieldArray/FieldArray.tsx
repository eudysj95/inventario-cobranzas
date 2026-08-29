import React, { useState, useId } from "react";

/**
 * FieldArray render function props
 * @interface FieldArrayRenderProps
 * @property {number} index - Current field index
 * @property {() => void} remove - Function to remove this field
 * @property {() => void} moveUp - Function to move field up
 * @property {() => void} moveDown - Function to move field down
 */
interface FieldArrayRenderProps {
  index: number;
  remove: () => void;
  moveUp: () => void;
  moveDown: () => void;
}

/**
 * FieldArray component props
 * @interface FieldArrayProps
 * @property {string} name - Name of the field array (for identification)
 * @property {(props: FieldArrayRenderProps) => React.ReactNode} render - Render function for each field
 * @property {string[]} [initialValues=[]] - Initial array values
 * @property {string} [addButtonLabel="Add"] - Label for the add button
 * @property {number} [minItems=0] - Minimum number of items allowed
 * @property {number} [maxItems=Infinity] - Maximum number of items allowed
 * @property {string} [className] - Additional CSS classes
 */
interface FieldArrayProps {
  name: string;
  render: (props: FieldArrayRenderProps) => React.ReactNode;
  initialValues?: string[];
  addButtonLabel?: string;
  minItems?: number;
  maxItems?: number;
  className?: string;
}

/**
 * FieldArray - A component for managing dynamic arrays of form fields
 *
 * Provides add/remove/move functionality with configurable min/max limits.
 * Each field receives render props for index and manipulation functions.
 *
 * @example
 * ```tsx
 * <FieldArray
 *   name="tags"
 *   initialValues={["react", "typescript"]}
 *   render={({ index, remove }) => (
 *     <div className="flex gap-2">
 *       <Input placeholder={`Tag ${index + 1}`} />
 *       <IconButton aria-label={`Remove tag ${index + 1}`} icon={<XIcon />} onClick={remove} />
 *     </div>
 *   )}
 *   addButtonLabel="Add Tag"
 *   maxItems={5}
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export function FieldArray({
  name,
  render,
  initialValues = [],
  addButtonLabel = "Add",
  minItems = 0,
  maxItems = Infinity,
  className = "",
}: FieldArrayProps) {
  const [fields, setFields] = useState(initialValues);
  const arrayId = useId();

  const addField = () => {
    if (fields.length < maxItems) {
      setFields([...fields, ""]);
    }
  };

  const removeField = (index: number) => {
    if (fields.length > minItems) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setFields(newFields);
    }
  };

  const moveDown = (index: number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} data-field-array={name}>
      {fields.map((_, index) => (
        <div key={`${arrayId}-${index}`} className="flex items-start gap-2">
          {render({
            index,
            remove: () => removeField(index),
            moveUp: () => moveUp(index),
            moveDown: () => moveDown(index),
          })}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost btn-sm self-start"
        onClick={addField}
        disabled={fields.length >= maxItems}
        aria-label={`Add ${name}`}
      >
        + {addButtonLabel}
      </button>
    </div>
  );
}