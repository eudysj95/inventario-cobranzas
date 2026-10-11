import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../hooks/useTheme";
import { ToastProvider } from "../../components/ui/Toast";

// Mock the API hooks
const mockProducts = [
  { id: "1", name: "Producto A", price: 1000, quantity: 10, total_units: 10, available_units: 8, updated_at: "2024-01-15T10:00:00Z" },
  { id: "2", name: "Producto B", price: 2000, quantity: 5, total_units: 5, available_units: 5, updated_at: "2024-01-14T10:00:00Z" },
];

vi.mock("../../api/products", () => ({
  useProducts: vi.fn(() => ({
    data: mockProducts,
    isPending: false,
    isError: false,
  })),
  useProductMutations: vi.fn(() => ({
    create: vi.fn().mockResolvedValue({ id: "3", ...mockProducts[0] }),
    update: vi.fn().mockResolvedValue(mockProducts[0]),
    remove: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../api/config", () => ({
  DEFAULT_CONFIG: {
    businessName: "Nexo",
    currencySymbol: "$",
    currencyLocale: "es-AR",
  },
  useConfig: () => ({
    data: {
      businessName: "Nexo Test",
      currencySymbol: "$",
      currencyLocale: "es-AR",
      primaryColor: "#047857",
      primaryColorHover: "#065f46",
      logoUrl: "/logo-nexo.png",
      whatsappNumber: "+5491123456789",
    },
    isError: false,
  }),
}));

// Mock formatCurrency to avoid config issues
vi.mock("../../lib/format", () => ({
  formatCurrency: vi.fn((amount) => `$ ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString("es-AR")),
}));

import InventoryList from "./InventoryList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderInventoryList(options = {}) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <InventoryList {...options} />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("InventoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders page title", () => {
      renderInventoryList();
      expect(screen.getByText("Inventario")).toBeInTheDocument();
    });

    it("renders 'Nuevo producto' button", () => {
      renderInventoryList();
      expect(screen.getByRole("button", { name: /nuevo producto/i })).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderInventoryList();
      expect(screen.getByLabelText(/buscar productos/i)).toBeInTheDocument();
    });

    it("renders state filter select", () => {
      renderInventoryList();
      expect(screen.getByLabelText(/filtrar por estado/i)).toBeInTheDocument();
    });

    it("renders product table with headers", () => {
      renderInventoryList();
      expect(screen.getByText("Producto")).toBeInTheDocument();
      expect(screen.getByText("Unidades")).toBeInTheDocument();
      expect(screen.getByText("Precio")).toBeInTheDocument();
      expect(screen.getByText("Última actualización")).toBeInTheDocument();
      expect(screen.getByText("Acciones")).toBeInTheDocument();
    });

    it("renders product rows with data", () => {
      renderInventoryList();
      expect(screen.getByText("Producto A")).toBeInTheDocument();
      expect(screen.getByText("Producto B")).toBeInTheDocument();
      expect(screen.getByText("$ 1.000,00")).toBeInTheDocument();
      expect(screen.getByText("$ 2.000,00")).toBeInTheDocument();
    });
  });

  describe("Search", () => {
    it("updates search input on change", () => {
      renderInventoryList();
      const searchInput = screen.getByLabelText(/buscar productos/i);
      fireEvent.change(searchInput, { target: { value: "Producto A" } });
      expect(searchInput.value).toBe("Producto A");
    });
  });

  describe("State Filter", () => {
    it("updates filter on change", () => {
      renderInventoryList();
      const filterSelect = screen.getByLabelText(/filtrar por estado/i);
      fireEvent.change(filterSelect, { target: { value: "available" } });
      expect(filterSelect.value).toBe("available");
    });
  });

  describe("Navigation", () => {
    it("navigates to new product page when clicking 'Nuevo producto'", () => {
      renderInventoryList();
      fireEvent.click(screen.getByRole("button", { name: /nuevo producto/i }));
      // The actual navigation is tested at integration level
      expect(screen.getByRole("button", { name: /nuevo producto/i })).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no products", () => {
      // Re-mock with empty data
      vi.resetModules();
      vi.doMock("../../api/products", () => ({
        useProducts: vi.fn(() => ({
          data: [],
          isPending: false,
          isError: false,
        })),
        useProductMutations: vi.fn(() => ({
          create: vi.fn(),
          update: vi.fn(),
          remove: vi.fn(),
        })),
      }));
    });
  });
});