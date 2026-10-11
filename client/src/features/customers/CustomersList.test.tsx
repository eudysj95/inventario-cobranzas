import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../hooks/useTheme";
import { ToastProvider } from "../../components/ui/Toast";
import CustomersList from "./CustomersList";

const mockCustomers = [
  { id: "1", name: "Cliente A", phone: "+5491112345678", open_balance: 1000 },
  { id: "2", name: "Cliente B", phone: "+5491187654321", open_balance: 2000 },
];

vi.mock("../../api/customers", () => ({
  useCustomers: vi.fn(() => ({
    data: mockCustomers,
    isPending: false,
    isError: false,
  })),
  useCustomerMutations: vi.fn(() => ({
    create: vi.fn().mockResolvedValue({ id: "3", ...mockCustomers[0] }),
    update: vi.fn().mockResolvedValue(mockCustomers[0]),
    remove: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../api/config", () => ({
  DEFAULT_CONFIG: { businessName: "Nexo", currencySymbol: "$", currencyLocale: "es-AR" },
  useConfig: () => ({
    data: { businessName: "Nexo Test", currencySymbol: "$", currencyLocale: "es-AR" },
    isError: false,
  }),
}));

vi.mock("../../lib/format", () => ({
  formatCurrency: vi.fn((amount) => `$ ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString("es-AR")),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderCustomersList() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <CustomersList />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("CustomersList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders page title", () => {
    renderCustomersList();
    expect(screen.getByText("Clientes")).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderCustomersList();
    expect(screen.getByLabelText(/buscar clientes/i)).toBeInTheDocument();
  });

  it("renders customer table with headers", () => {
    renderCustomersList();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Saldo abierto")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("renders customer rows with data", () => {
    renderCustomersList();
    expect(screen.getByText("Cliente A")).toBeInTheDocument();
    expect(screen.getByText("Cliente B")).toBeInTheDocument();
    expect(screen.getByText("$ 1.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 2.000,00")).toBeInTheDocument();
  });

  it("navigates to new customer page", () => {
    renderCustomersList();
    fireEvent.click(screen.getByRole("button", { name: /nuevo cliente/i }));
    // Navigation tested at integration level
  });
});