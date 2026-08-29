import { useMemo } from "react";
import { IconButton } from "../ui/IconButton";
import { Tooltip } from "../ui/Tooltip";

/**
 * WhatsAppHub variant types
 * @typedef {"fab" | "inline" | "button"} WhatsAppVariant
 */

/**
 * WhatsAppHub template types
 * @typedef {"collection" | "saleConfirmation" | "apartadoReminder" | "custom"} WhatsAppTemplate
 */

/**
 * WhatsAppHub component props
 * @interface WhatsAppHubProps
 * @property {string} phone - Phone number in international format (e.g., "+5491123456789")
 * @property {string} [message] - Custom message (used when template is "custom")
 * @property {WhatsAppVariant} [variant="fab"] - Display variant
 * @property {Record<string, string>} [prefillData] - Data for template interpolation
 * @property {WhatsAppTemplate} [template] - Template to use
 * @property {string} [className] - Additional CSS classes
 */
interface WhatsAppHubProps {
  phone: string;
  message?: string;
  variant?: "fab" | "inline" | "button";
  prefillData?: Record<string, string>;
  template?: "collection" | "saleConfirmation" | "apartadoReminder" | "custom";
  className?: string;
}

/**
 * WhatsApp message templates
 */
const templates = {
  collection: (data: Record<string, string>) =>
    `Hola ${data.customerName ?? ""}, tu pago de ${data.amount ?? ""} vence el ${data.dueDate ?? ""}.`,
  saleConfirmation: (data: Record<string, string>) =>
    `Gracias por tu compra ${data.orderId ?? ""}. Total: ${data.amount ?? ""}.`,
  apartadoReminder: (data: Record<string, string>) =>
    `Recordatorio: tu apartado ${data.apartadoId ?? ""} vence el ${data.dueDate ?? ""}.`,
  custom: (_data: Record<string, string>) => "",
};

/**
 * Normalize phone to digits only for wa.me link
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Build wa.me deep link
 */
function buildWaLink(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Interpolate template with prefillData
 */
function interpolateTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}

/**
 * WhatsAppHub - WhatsApp contact component with FAB, inline, and button variants
 *
 * Provides a consistent way to initiate WhatsApp conversations with pre-filled messages
 * using templates or custom messages. Generates wa.me deep links that open in new tabs.
 *
 * Variants:
 * - **fab**: Fixed bottom-right floating action button with pulse animation and tooltip
 * - **inline**: Icon-only button (32px) for table rows and compact spaces
 * - **button**: Full button with "WhatsApp" label for forms and modals
 *
 * @example
 * ```tsx
 * // FAB variant
 * <WhatsAppHub phone="+5491123456789" variant="fab" />
 *
 * // Inline with template
 * <WhatsAppHub
 *   phone="+5491123456789"
 *   variant="inline"
 *   template="collection"
 *   prefillData={{ customerName: "Juan", amount: "$1.000", dueDate: "15/08/2026" }}
 * />
 *
 * // Button variant with custom message
 * <WhatsAppHub
 *   phone="+5491123456789"
 *   variant="button"
 *   message="Hola, quiero información"
 * />
 * ```
 *
 * @component
 * @category WhatsApp
 */
export function WhatsAppHub({
  phone,
  message,
  variant = "fab",
  prefillData = {},
  template,
  className = "",
}: WhatsAppHubProps) {
  // Build the message from template or custom message
  const finalMessage = useMemo(() => {
    if (template && template !== "custom" && templates[template]) {
      return templates[template](prefillData);
    }
    return message ?? "";
  }, [template, prefillData, message]);

  const waLink = useMemo(() => {
    if (!phone || !finalMessage) return null;
    return buildWaLink(phone, finalMessage);
  }, [phone, finalMessage]);

  const variantClasses = {
    fab: "whatsapp-fab btn btn-primary rounded-full p-3 shadow-lg fixed bottom-4 right-4 z-50 animate-pulse hover:scale-105 transition-transform",
    inline: "whatsapp-inline btn btn-ghost btn-sm p-2",
    button: "whatsapp-button btn btn-primary gap-2",
  };

  const icon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  // FAB variant with tooltip
  if (variant === "fab") {
    return (
      <Tooltip content="Contactar por WhatsApp" position="left">
        <a
          href={waLink ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`${variantClasses.fab} ${className}`}
          aria-label="Contactar por WhatsApp"
          data-wa-event="click"
          data-testid="whatsapp-fab"
          onClick={(e) => {
            if (!waLink) e.preventDefault();
          }}
        >
          {icon}
        </a>
      </Tooltip>
    );
  }

  // Inline variant (icon-only)
  if (variant === "inline") {
    return (
      <a
        href={waLink ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`${variantClasses.inline} ${className}`}
        aria-label="Contactar por WhatsApp"
        data-wa-event="click"
        data-testid="whatsapp-inline"
        onClick={(e) => {
          if (!waLink) e.preventDefault();
        }}
      >
        {icon}
      </a>
    );
  }

  // Button variant (with label)
  return (
    <a
      href={waLink ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variantClasses.button} ${className}`}
      aria-label="Contactar por WhatsApp"
      data-wa-event="click"
      data-testid="whatsapp-button"
      onClick={(e) => {
        if (!waLink) e.preventDefault();
      }}
    >
      {icon}
      <span>WhatsApp</span>
    </a>
  );
}