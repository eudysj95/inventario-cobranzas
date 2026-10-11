import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../hooks/useTheme";
import { ToastProvider } from "../../components/ui/Toast";
import CustomerForm from "./CustomerForm";

vi.mock("../../api/customers", () => ({
  createCustomer: vi.fn().mockResolvedValue({ id: "3", name: "Nuevo", phone: "" }),
  updateCustomer: vi.fn().mockResolvedValue({ id: "1", name: "Editado", phone: "+5491112345678" }),
}));

vi.mock("../../api/config", () => ({
  DEFAULT_CONFIG: { businessName: "Nexo", currencySymbol: "$", currencyLocale: "es-AR" },
  useConfig: () => ({ data: { businessName: "Nexo Test", currencySymbol: "$", currencyLocale: "es-AR" }, isError: false }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderCustomerForm(mode = "new", initialCustomer = null) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <CustomerForm mode={mode} initialCustomer={initialCustomer} />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("CustomerForm", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("New Mode", () => {
    it("renders 'Nuevo cliente' title", () => {
      renderCustomerForm("new");
      expect(screen.getByText("Nuevo cliente")).toBeInTheDocument();
    });

    it("renders name and phone fields", () => {
      renderCustomerForm("new");
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      // Phone field is wrapped in input-group div, check for input directly
      expect(screen.getByPlaceholderText(/ej: \+54 9 11/i)).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
      renderCustomerForm("new");
      fireEvent.click(screen.getByRole("button", { name: /crear/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/nombre del cliente es obligatorio/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edit Mode", () => {
    const mockCustomer = { id: "1", name: "Cliente A", phone: "+5491112345678" };

    it("renders 'Editar cliente' title", () => {
      renderCustomerForm("edit", mockCustomer);
      expect(screen.getByText("Editar cliente")).toBeInTheDocument();
    });

    it("pre-fills form fields with customer data", () => {
      renderCustomerForm("edit", mockCustomer);
      expect(screen.getByLabelText(/nombre/i)).toHaveValue(mockCustomer.name);
      expect(screen.getByPlaceholderText(/ej: \+54 9 11/i)).toHaveValue(mockCustomer.phone);
    });

    it("shows validation error when name is empty", async () => {
      renderCustomerForm("edit", mockCustomer);
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "" } });
      fireEvent.click(screen.getByRole("button", { name: /actualizar/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/nombre del cliente es obligatorio/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});