import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../hooks/useTheme";
import { ToastProvider } from "../../components/ui/Toast";
import InventoryForm from "./InventoryForm";

// Mock the API hooks
const mockProducts = [
  { id: "1", name: "Producto A", price: 1000, quantity: 10, description: "Desc A", available_units: 8 },
  { id: "2", name: "Producto B", price: 2000, quantity: 5, description: "Desc B", available_units: 5 },
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
  quantityAdjustmentBody: vi.fn((current, target) => ({ quantity: target - current })),
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
    },
    isError: false,
  }),
}));

vi.mock("../../lib/format", () => ({
  formatCurrency: vi.fn((amount) => `$ ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString("es-AR")),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderInventoryForm(mode = "new", product = null) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <InventoryForm mode={mode} product={product} />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function renderInventoryFormWithSubmit(mode = "new", product = null, onSubmit: any) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <InventoryForm mode={mode} product={product} onSubmit={onSubmit} />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("InventoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("New Mode", () => {
    it("renders 'Nuevo producto' title", () => {
      renderInventoryForm("new");
      expect(screen.getByText("Nuevo producto")).toBeInTheDocument();
    });

    it("renders form fields: name, description, price, quantity", () => {
      renderInventoryForm("new");
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripci/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stock inicial/i)).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
      renderInventoryForm("new");
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/nombre del producto es obligatorio/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("shows validation error when price is negative", async () => {
      renderInventoryForm("new");
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: "-100" } });
      fireEvent.change(screen.getByLabelText(/stock inicial/i), { target: { value: "10" } });
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/precio debe ser un número mayor o igual a cero/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("shows validation error when quantity is not integer", async () => {
      renderInventoryForm("new");
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: "100" } });
      fireEvent.change(screen.getByLabelText(/stock inicial/i), { target: { value: "10.5" } });
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/cantidad debe ser un número entero mayor o igual a cero/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edit Mode", () => {
    const mockProduct = mockProducts[0];

    it("renders 'Editar producto' title with product name", () => {
      renderInventoryForm("edit", mockProduct);
      expect(screen.getByText(`Editar producto: ${mockProduct.name}`)).toBeInTheDocument();
    });

    it("pre-fills form fields with product data", () => {
      renderInventoryForm("edit", mockProduct);
      expect(screen.getByLabelText(/nombre/i)).toHaveValue(mockProduct.name);
      expect(screen.getByLabelText(/descripci/i)).toHaveValue(mockProduct.description);
      // Input value is a number for type="number" fields
      expect(screen.getByLabelText(/precio/i)).toHaveValue(mockProduct.price);
      expect(screen.getByLabelText(/stock \(cantidad objetivo\)/i)).toHaveValue(mockProduct.quantity);
    });

    it("shows current state badge", () => {
      renderInventoryForm("edit", mockProduct);
      expect(screen.getByText(/estado actual/i)).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
      renderInventoryForm("edit", mockProduct);
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "" } });
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      await waitFor(() => {
        const errors = screen.getAllByText(/nombre del producto es obligatorio/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Form Actions", () => {
    it("calls onSubmit with create payload in new mode", async () => {
      const onSubmit = vi.fn();
      renderInventoryFormWithSubmit("new", null, onSubmit);
      
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Nuevo" } });
      fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: "500" } });
      fireEvent.change(screen.getByLabelText(/stock inicial/i), { target: { value: "20" } });
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: "create",
            body: expect.objectContaining({
              name: "Nuevo",
              price: 500,
              quantity: 20,
            }),
          })
        );
      });
    });

    it("calls onSubmit with edit payload in edit mode", async () => {
      const onSubmit = vi.fn();
      const mockProduct = mockProducts[0];
      renderInventoryFormWithSubmit("edit", mockProduct, onSubmit);
      
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Editado" } });
      fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: "edit",
            id: mockProduct.id,
            patch: expect.objectContaining({
              name: "Editado",
            }),
          })
        );
      });
    });
  });
});