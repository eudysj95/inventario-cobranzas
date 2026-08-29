import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Table column definition
 * @interface TableColumn
 * @property {string} key - Unique key for the column (matches data object key)
 * @property {string} header - Column header text
 * @property {(value: any, row: T) => React.ReactNode} [render] - Custom cell renderer
 * @property {string} [className] - CSS class for the column cells
 * @property {string} [headerClassName] - CSS class for the header cell
 */
interface TableColumn<T = Record<string, any>> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/**
 * Table component props
 * @interface TableProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {TableColumn<T>[]} columns - Column definitions
 * @property {T[]} data - Array of data objects
 * @property {string} keyField - Unique key field in data objects
 * @property {string} [emptyMessage="No data available"] - Message when data is empty
 * @property {boolean} [striped=false] - Whether to stripe rows
 * @property {boolean} [hoverable=false] - Whether to show hover effect
 * @property {string} [caption] - Table caption for accessibility
 */
interface TableProps<T = Record<string, any>> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: string;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  caption?: string;
}

/**
 * Table - A data table component wrapping the .table utility classes
 *
 * Supports custom cell renderers, striped rows, hover effects, and empty states.
 * Uses the .table-wrap for horizontal scrolling on mobile.
 *
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: "name", header: "Name" },
 *     { key: "email", header: "Email" },
 *     { key: "role", header: "Role", render: (v) => <Badge>{v}</Badge> },
 *   ]}
 *   data={users}
 *   keyField="id"
 *   striped
 *   hoverable
 *   caption="User Directory"
 * />
 * ```
 *
 * @component
 * @category Primitives
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ columns, data, keyField, emptyMessage = "No data available", striped = false, hoverable = false, caption, className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`table-wrap ${className}`} {...props}>
        <table className="table" role="table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={col.headerClassName}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField]}
                  className={`${striped && rowIndex % 2 === 1 ? "bg-surface-hover" : ""} ${hoverable ? "hover:bg-surface-hover" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";