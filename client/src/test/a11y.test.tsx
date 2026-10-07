import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import React from "react";

expect.extend(matchers);

// Mock API modules at top level
vi.mock("@/api/products", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useProducts: vi.fn(() => ({
      data: [
        { id: "1", name: "Producto A", price: 100, stock: 10, category: "Cat1" },
        { id: "2", name: "Producto B", price: 200, stock: 5, category: "Cat2" },
      ],
      isPending: false,
      isError: false,
    })),
    useProductMutations: vi.fn(() => ({
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    })),
  };
});

vi.mock("@/api/customers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCustomers: vi.fn(() => ({
      data: [
        { id: "1", name: "Cliente A", phone: "123456789", email: "a@test.com" },
        { id: "2", name: "Cliente B", phone: "987654321", email: "b@test.com" },
      ],
      isPending: false,
      isError: false,
    })),
    useCustomer: vi.fn(() => ({
      data: { id: "1", name: "Cliente A", phone: "123456789", email: "a@test.com" },
      isPending: false,
      isError: false,
    })),
    useCustomerMutations: vi.fn(() => ({
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })),
  };
});

vi.mock("@/api/suppliers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSuppliers: vi.fn(() => ({
      data: [
        { id: "1", name: "Proveedor A" },
        { id: "2", name: "Proveedor B" },
      ],
      isPending: false,
      isError: false,
    })),
  };
});

vi.mock("@/api/config", () => ({
  DEFAULT_CONFIG: {
    businessName: "Nexo",
    currencySymbol: "$",
    currencyLocale: "es-AR",
  },
  useConfig: () => ({
    data: {
      businessName: "Nexo Test",
      primaryColor: "#047857",
      primaryColorHover: "#065f46",
      logoUrl: "/logo-nexo.png",
      whatsappNumber: "+5491123456789",
    },
    isError: false,
  }),
}));

vi.mock("@/api/auth", () => ({
  GENERIC_LOGIN_ERROR: "Usuario o contraseña incorrectos.",
  useCurrentUser: () => ({
    status: "success",
    data: null,
  }),
  useAuthActions: () => ({
    logIn: vi.fn(),
    logOut: vi.fn(),
  }),
}));

// Import page components directly
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import InventoryPage from "@/features/inventory/InventoryPage";
import ProductForm from "@/features/inventory/ProductForm";
import CustomersPage from "@/features/customers/CustomersPage";
import CustomerForm from "@/features/customers/CustomerForm";
import SuppliersPage from "@/features/suppliers/SuppliersPage";
import CollectionsPage from "@/features/collections/CollectionsPage";
import CashSalesPage from "@/features/credit/CashSalesPage";
import CreditSalesPage from "@/features/credit/CreditSalesPage";
import ApartadosPage from "@/features/apartados/ApartadosPage";
import PaymentsPage from "@/features/credit/PaymentsPanel";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Test utilities
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

const renderPage = (Page: React.ComponentType<any>, props = {}) => {
  return render(<Wrapper><Page {...props} /></Wrapper>);
};

describe("Accessibility Audit (axe-core) — Page Level", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const runAxeOnPage = async (Page: React.ComponentType<any>, props = {}) => {
    const { container } = renderPage(Page, props);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  };

  it("Login page — should have no a11y violations", async () => {
    await runAxeOnPage(LoginPage);
  });

  it("Dashboard page — should have no a11y violations", async () => {
    await runAxeOnPage(DashboardPage);
  });

  it("Inventory list page — should have no a11y violations", async () => {
    await runAxeOnPage(InventoryPage);
  });

  it("Product form page — should have no a11y violations", async () => {
    await runAxeOnPage(ProductForm, { product: null });
  });

  it("Customers list page — should have no a11y violations", async () => {
    await runAxeOnPage(CustomersPage);
  });

  it("Customer form page — should have no a11y violations", async () => {
    await runAxeOnPage(CustomerForm);
  });

  it("Suppliers list page — should have no a11y violations", async () => {
    await runAxeOnPage(SuppliersPage);
  });

  it("Collections page — should have no a11y violations", async () => {
    await runAxeOnPage(CollectionsPage);
  });

  it("Cash sales page — should have no a11y violations", async () => {
    await runAxeOnPage(CashSalesPage);
  });

  it("Credit sales page — should have no a11y violations", async () => {
    await runAxeOnPage(CreditSalesPage);
  });

  it("Apartados page — should have no a11y violations", async () => {
    await runAxeOnPage(ApartadosPage);
  });

  it("Payments page — should have no a11y violations", async () => {
    await runAxeOnPage(PaymentsPage);
  });
});

// Component-level a11y tests - run sequentially
describe("UI Primitives — Accessibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const wrapper = Wrapper;

  it("Button — should have no a11y violations", async () => {
    const { Button } = await import("@/components/ui/Button/Button");
    const { container } = render(<Button>Click me</Button>, { wrapper });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Input — should have no a11y violations", async () => {
    const { Input } = await import("@/components/ui/Input/Input");
    const { container } = render(<Input label="Email" type="email" />, { wrapper });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Select — should have no a11y violations", async () => {
    const { Select } = await import("@/components/ui/Select/Select");
    const { container } = render(
      <Select label="Category" options={[{ value: "1", label: "Option 1" }]} />,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Modal — should have no a11y violations", async () => {
    const { Modal } = await import("@/components/ui/Modal/Modal");
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Table — should have no a11y violations", async () => {
    const { Table } = await import("@/components/ui/Table/Table");
    const { container } = render(
      <Table columns={[{ key: "name", header: "Name" }]} data={[{ name: "Item 1", id: "1" }]} />,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Toast — should have no a11y violations", async () => {
    const { ToastProvider, useToast } = await import("@/components/ui/Toast/ToastProvider");
    const ToastTest = () => {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast({ title: "Test", description: "Test toast" })}>Show Toast</button>
        </div>
      );
    };
    const { container } = render(
      <ToastProvider>
        <ToastTest />
      </ToastProvider>,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("FormLayout — should have no a11y violations", async () => {
    const { FormLayout } = await import("@/components/forms/FormLayout");
    const { container } = render(
      <FormLayout>
        <div>Field 1</div>
        <div>Field 2</div>
      </FormLayout>,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Sidebar — should have no a11y violations", async () => {
    const { container } = render(
      <Sidebar
        navItems={[
          { path: "/", label: "Dashboard", icon: "dashboard" },
          { path: "/inventory", label: "Inventario", icon: "inventory" },
        ]}
        userName="Test User"
        userRole="Admin"
        onLogout={() => {}}
      />,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Header — should have no a11y violations", async () => {
    const { container } = render(
      <Header
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Dashboard", path: "/dashboard" },
        ]}
        userName="Test User"
        userRole="Admin"
        onLogout={() => {}}
        onMenuClick={() => {}}
        onSidebarToggle={() => {}}
        sidebarCollapsed={false}
      />,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("WhatsAppHub — should have no a11y violations", async () => {
    const { WhatsAppHub } = await import("@/components/whatsapp/WhatsAppHub");
    const { container } = render(
      <WhatsAppHub variant="fab" phoneNumber="+1234567890" />,
      { wrapper }
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});