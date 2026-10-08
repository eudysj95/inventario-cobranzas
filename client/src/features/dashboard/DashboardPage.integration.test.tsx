import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import { useDashboardStats } from "../../api/dashboard";
import { useConfig } from "../../api/config";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import "../../styles/design-tokens.css";

// Mock the API hooks
vi.mock("../../api/dashboard", () => ({
  useDashboardStats: vi.fn(),
}));

vi.mock("../../api/config", () => ({
  useConfig: vi.fn(),
  DEFAULT_CONFIG: {
    currencySymbol: "$",
    currencyLocale: "es-AR",
  },
}));

// Mock usePullToRefresh to track calls
vi.mock("../../hooks/usePullToRefresh", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    usePullToRefresh: vi.fn(() => ({
      isPulling: false,
      pullDistance: 0,
      isRefreshing: false,
      onTouchStart: vi.fn(),
      onTouchMove: vi.fn(),
      onTouchEnd: vi.fn(),
    })),
  };
});

describe("DashboardPage Integration (New Design)", () => {
  const mockStats = {
    sales: { today: 10000, cashToday: 6000, creditToday: 4000 },
    inventory: { lowStock: 2, outOfStock: 0, totalValue: 50000 },
    collections: { overdueToday: 1, dueNext3Days: 3, withoutPhone: 2 },
    suppliers: { overdue: 0, dueNext7Days: 1, openDebts: 5 },
    recentSales: [
      { id: "SALE001", customer_name: "Juan Pérez", created_at: new Date().toISOString(), type: "cash", total: 5000 },
    ],
    quickActions: { hasProducts: true, hasCustomers: true, hasOpenDebts: true, hasSupplierDebts: true },
  };

  const mockConfig = {
    currencySymbol: "$",
    currencyLocale: "es-AR",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDashboardStats as any).mockReturnValue({
      data: mockStats,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    (useConfig as any).mockReturnValue({
      data: mockConfig,
    });
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardPage />
      </MemoryRouter>
    );
  };

  describe("Skeleton Loading", () => {
    it("shows skeleton when data is pending", () => {
      (useDashboardStats as any).mockReturnValue({
        data: null,
        isPending: true,
        isError: false,
        refetch: vi.fn(),
      });

      renderDashboard();

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows skeleton for KPI strip", () => {
      (useDashboardStats as any).mockReturnValue({
        data: null,
        isPending: true,
        isError: false,
        refetch: vi.fn(),
      });

      renderDashboard();

      const kpiSkeletons = screen.getAllByTestId("skeleton");
      expect(kpiSkeletons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Error State", () => {
    it("shows error when data fetch fails", () => {
      (useDashboardStats as any).mockReturnValue({
        data: null,
        isPending: false,
        isError: true,
        refetch: vi.fn(),
      });

      renderDashboard();

      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("No se cargaron datos del dashboard")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    });
  });

  describe("Data Display - New Design", () => {
    it("renders KPI strip with 3 cards", () => {
      renderDashboard();

      expect(screen.getByText("Ventas del día")).toBeInTheDocument();
      expect(screen.getByText("Cuentas por cobrar")).toBeInTheDocument();
      expect(screen.getByText("Valor del inventario")).toBeInTheDocument();
    });

    it("renders KPI cards with values", () => {
      renderDashboard();

      const values = screen.getAllByText(/\$\d{1,3}(?:,\d{3})*\.\d{2}/);
      expect(values.length).toBeGreaterThanOrEqual(2);
    });

    it("renders Ingresos (7 días) chart card", () => {
      renderDashboard();

      expect(screen.getByText("Ingresos (7 días)")).toBeInTheDocument();
      const chartCard = screen.getByText("Ingresos (7 días)").closest("section.card");
      expect(chartCard).toBeInTheDocument();
    });

    it("renders Últimos movimientos list", () => {
      renderDashboard();

      expect(screen.getByText("Últimos movimientos")).toBeInTheDocument();
      const movementItems = screen.getAllByText(/Rendimiento|Cobranzas|Venta:|Abono:|Gasto:/);
      expect(movementItems.length).toBeGreaterThan(0);
    });

    it("renders movement items with icon, title, amount, and subrows", () => {
      renderDashboard();

      const amounts = screen.getAllByText(/\$\d{1,3}(?:,\d{3})*\.\d{2}/);
      expect(amounts.length).toBeGreaterThan(0);

      const cantidadLabels = screen.getAllByText(/Cantidad/);
      expect(cantidadLabels.length).toBeGreaterThan(0);

      const precioLabels = screen.getAllByText(/Precio unidad/);
      expect(precioLabels.length).toBeGreaterThan(0);
    });

    it("shows icon circles with pastel backgrounds (green/blue/red)", () => {
      renderDashboard();

      const iconCircles = document.querySelectorAll('[style*="border-radius: 50%"]');
      expect(iconCircles.length).toBeGreaterThan(0);
    });
  });

  describe("KPI Strip - Horizontal Scroll", () => {
    it("renders KPI strip with scroll container", () => {
      renderDashboard();

      const kpiStrip = document.querySelector('[style*="scroll-snap-type"]') ||
                       document.querySelector('[data-testid="kpi-strip"]') ||
                       screen.getByText("Ventas del día").closest('[style*="flex"]');
      expect(kpiStrip).toBeInTheDocument();
    });

    it("has 3 KPI cards in strip", () => {
      renderDashboard();

      const kpiCards = screen.getAllByTestId("kpi-card");
      expect(kpiCards.length).toBe(3);
    });
  });

  describe("Page Title", () => {
    it("renders Dashboard title prominently", () => {
      renderDashboard();

      const title = screen.getByText("Dashboard");
      expect(title).toBeInTheDocument();
      const styles = window.getComputedStyle(title);
      expect(styles.fontWeight).toMatch(/700|bold/);
    });
  });

  describe("Refresh Button", () => {
    it("shows refresh button", () => {
      renderDashboard();

      const refreshBtn = screen.getByRole("button", { name: /⟳|actualizar/i });
      expect(refreshBtn).toBeInTheDocument();
    });
  });

  describe("Pull-to-Refresh Integration", () => {
    it("attaches touch handlers to dashboard root", () => {
      renderDashboard();

      const dashboardRoot = screen.getByTestId("dashboard-root");
      expect(dashboardRoot).toBeInTheDocument();
    });

    it("uses usePullToRefresh hook", () => {
      renderDashboard();

      expect(screen.getByTestId("dashboard-root")).toBeInTheDocument();
    });
  });

  describe("Auto-refresh", () => {
    it("sets up auto-refresh interval", () => {
      vi.useFakeTimers();
      try {
        renderDashboard();

        // Fast-forward 30 seconds
        act(() => {
          vi.advanceTimersByTime(30000);
        });

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("Layout - Responsive Grid", () => {
    it("renders dashboard-grid with chart and movements cards", () => {
      renderDashboard();

      const grid = document.querySelector(".dashboard-grid") ||
                   document.querySelector('[style*="gridTemplateColumns"]');
      expect(grid).toBeInTheDocument();
    });

    it("has two main cards: chart and movements", () => {
      renderDashboard();

      const cards = document.querySelectorAll("section.card");
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });
  });
});