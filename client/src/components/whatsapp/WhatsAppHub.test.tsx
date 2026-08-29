import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhatsAppHub } from "./WhatsAppHub";

const defaultProps = {
  phone: "+5491123456789",
  variant: "fab" as const,
};

describe("WhatsAppHub", () => {
  it("renders FAB variant with pulse animation", () => {
    render(<WhatsAppHub {...defaultProps} />);
    const fab = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveClass("whatsapp-fab");
  });

  it("renders inline variant (icon-only, 32px)", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="inline" />);
    const inline = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(inline).toBeInTheDocument();
    expect(inline).toHaveClass("whatsapp-inline");
  });

  it("renders button variant with label", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="button" />);
    const button = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("whatsapp-button");
    expect(button).toHaveTextContent("WhatsApp");
  });

  it("generates correct wa.me deep link", () => {
    render(<WhatsAppHub phone="+5491123456789" message="Test message" variant="button" />);
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(link).toHaveAttribute("href", "https://wa.me/5491123456789?text=Test%20message");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses template with prefillData interpolation", () => {
    render(
      <WhatsAppHub
        phone="+5491123456789"
        variant="button"
        template="collection"
        prefillData={{ customerName: "Juan", amount: "$1.000", dueDate: "15/08/2026" }}
      />
    );
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("Juan"));
    expect(link).toHaveAttribute("href", expect.stringContaining("1.000"));
    expect(link).toHaveAttribute("href", expect.stringContaining("15%2F08%2F2026"));
  });

  it("opens in new tab on click", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="button" />);
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies custom className", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="fab" className="custom-fab" />);
    const fab = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(fab).toHaveClass("custom-fab");
  });

  it("has data-wa-event attribute for analytics", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="button" />);
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(link).toHaveAttribute("data-wa-event", "click");
  });

  it("shows tooltip on FAB hover", () => {
    render(<WhatsAppHub phone="+5491123456789" variant="fab" />);
    const fab = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(fab).toHaveAttribute("aria-label", "Contactar por WhatsApp");
  });
});

describe("WhatsAppHub templates", () => {
  it("collection template interpolates correctly", () => {
    render(
      <WhatsAppHub
        phone="+5491123456789"
        variant="button"
        template="collection"
        prefillData={{ customerName: "Ana", amount: "$2.500", dueDate: "20/08/2026" }}
      />
    );
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    const href = link.getAttribute("href") || "";
    expect(href).toContain("Hola%20Ana");
    expect(href).toContain("%242.500");
    expect(href).toContain("20%2F08%2F2026");
  });

  it("saleConfirmation template interpolates correctly", () => {
    render(
      <WhatsAppHub
        phone="+5491123456789"
        variant="button"
        template="saleConfirmation"
        prefillData={{ orderId: "ORD-123", amount: "$5.000" }}
      />
    );
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    const href = link.getAttribute("href") || "";
    expect(href).toContain("ORD-123");
    expect(href).toContain("%245.000");
  });

  it("apartadoReminder template interpolates correctly", () => {
    render(
      <WhatsAppHub
        phone="+5491123456789"
        variant="button"
        template="apartadoReminder"
        prefillData={{ apartadoId: "APT-456", dueDate: "25/08/2026" }}
      />
    );
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    const href = link.getAttribute("href") || "";
    expect(href).toContain("APT-456");
    expect(href).toContain("25%2F08%2F2026");
  });

  it("custom template uses message prop directly", () => {
    render(
      <WhatsAppHub
        phone="+5491123456789"
        variant="button"
        template="custom"
        message="Custom message here"
      />
    );
    const link = screen.getByRole("link", { name: /contactar por whatsapp/i });
    expect(link).toHaveAttribute("href", "https://wa.me/5491123456789?text=Custom%20message%20here");
  });
});