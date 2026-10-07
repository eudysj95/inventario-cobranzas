import { ReactNode } from "react";
import "./FormLayout.css";

interface FormLayoutProps {
  children: ReactNode;
  className?: string;
}

interface FormLayoutSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * FormLayout - A two-column layout for forms with sidebar (fields) and panel (preview/summary)
 *
 * Desktop (≥768px): Two-column grid - sidebar 70%, panel 30%
 * Mobile (<768px): Stacked - sidebar on top, panel below
 *
 * @example
 * ```tsx
 * <FormLayout>
 *   <FormLayout.Sidebar>
 *     <Field label="Name"><Input /></Field>
 *   </FormLayout.Sidebar>
 *   <FormLayout.Panel>
 *     <PreviewSummary />
 *   </FormLayout.Panel>
 * </FormLayout>
 * ```
 */
export function FormLayout({ children, className = "" }: FormLayoutProps) {
  return (
    <div className={`form-layout ${className}`} data-testid="form-layout">
      {children}
    </div>
  );
}

/**
 * FormLayout.Sidebar - The form fields column (70% on desktop, full width on mobile)
 */
FormLayout.Sidebar = function Sidebar({ children, className = "" }: FormLayoutSectionProps) {
  return (
    <aside
      className={`form-layout-sidebar ${className}`}
      data-testid="form-layout-sidebar"
      role="complementary"
      aria-label="Formulario"
    >
      {children}
    </aside>
  );
};

/**
 * FormLayout.Panel - The preview/summary column (30% on desktop, full width on mobile)
 */
FormLayout.Panel = function Panel({ children, className = "" }: FormLayoutSectionProps) {
  return (
    <section
      className={`form-layout-panel ${className}`}
      data-testid="form-layout-panel"
      role="region"
      aria-label="Resumen"
    >
      {children}
    </section>
  );
};