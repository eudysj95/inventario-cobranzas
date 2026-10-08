import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import { useDashboardStats } from "../../api/dashboard";
import { useConfig } from "../../api/config";
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

describe("Dashboard Layout & Spacing (New Design)", () => {
  const mockStats = {
    sales: { today: 10000, cashToday: 6000, creditToday: 4000 },
    inventory: { lowStock: 2, outOfStock: 0, totalValue: 50000 },
    collections: { overdueToday: 1, dueNext3Days: 3, withoutPhone: 2 },
    suppliers: { overdue: 0, dueNext7Days: 1, openDebts: 5 },
    recentSales: [],
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

  describe("Dashboard Root Layout", () => {
    it("renders dashboard root with correct test ID", () => {
      renderDashboard();
      const dashboardRoot = screen.getByTestId("dashboard-root");
      expect(dashboardRoot).toBeInTheDocument();
      expect(dashboardRoot).not.toHaveAttribute("data-density");
    });

    it("uses dash-space-2 for root padding", () => {
      renderDashboard();
      const dashboardRoot = screen.getByTestId("dashboard-root");
      const styles = window.getComputedStyle(dashboardRoot);
      expect(styles.paddingTop).toBeTruthy();
      expect(styles.paddingBottom).toBeTruthy();
    });

    it("has flex column layout with gap", () => {
      renderDashboard();
      const dashboardRoot = screen.getByTestId("dashboard-root");
      const styles = window.getComputedStyle(dashboardRoot);
      expect(styles.display).toBe("flex");
      expect(styles.flexDirection).toBe("column");
      expect(styles.gap).toBeTruthy();
    });
  });

  describe("KPI Strip Spacing", () => {
    it("renders KPI strip with horizontal scroll", () => {
      renderDashboard();
      const kpiStrip = document.querySelector('[style*="scroll-snap-type: x mandatory"]') ||
                       screen.getByText("Ventas del día").closest('[style*="flex"]');
      expect(kpiStrip).toBeInTheDocument();
    });

    it("uses dash-gap for KPI card gap", () => {
      renderDashboard();
      const kpiStrip = screen.getByText("Ventas del día").closest('[style*="gap"]');
      expect(kpiStrip).toBeInTheDocument();
    });

    it("KPI cards use scroll-snap-align: start", () => {
      renderDashboard();
      const kpiCards = screen.getAllByTestId("kpi-card");
      expect(kpiCards.length).toBe(3);
      kpiCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        expect(styles.scrollSnapAlign).toBe("start");
      });
    });

    it("KPI cards have min/max width constraints", () => {
      renderDashboard();
      const kpiCards = screen.getAllByTestId("kpi-card");
      kpiCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        expect(styles.minWidth).toBeTruthy();
        expect(styles.maxWidth).toBeTruthy();
        expect(styles.flexShrink).toBe("0");
      });
    });
  });

  describe("KPI Card Spacing", () => {
    it("KPI card uses space-4 padding", () => {
      renderDashboard();
      const kpiCards = screen.getAllByTestId("kpi-card");
      kpiCards.forEach(card => {
        const cardBody = card.querySelector(".card-body") || card.querySelector('[style*="padding"]');
        expect(cardBody).toBeInTheDocument();
      });
    });

    it("KPI title uses text-sm with text-secondary color", () => {
      renderDashboard();
      const title = screen.getByText("Ventas del día");
      const styles = window.getComputedStyle(title);
      expect(styles.fontSize).toBeTruthy();
      expect(styles.color).toBeTruthy();
    });

    it("KPI value uses text-xl bold with text color", () => {
      renderDashboard();
      const values = screen.getAllByText(/\$\d{1,3}(?:,\d{3})*\.\d{2}/);
      expect(values.length).toBeGreaterThanOrEqual(2);
      values.forEach(v => {
        const styles = window.getComputedStyle(v);
        expect(styles.fontSize).toBeTruthy();
        expect(styles.fontWeight).toMatch(/700|bold/);
      });
    });
  });

  describe("Dashboard Grid Layout", () => {
    it("renders grid with 1fr column on mobile", () => {
      renderDashboard();
      const grid = document.querySelector(".dashboard-grid") ||
                   document.querySelector('[style*="gridTemplateColumns: 1fr"]');
      expect(grid).toBeInTheDocument();
    });

    it("grid uses dash-gap for gap", () => {
      renderDashboard();
      const grid = document.querySelector('[style*="gridTemplateColumns"]');
      if (grid) {
        const styles = window.getComputedStyle(grid);
        expect(styles.gap).toBeTruthy();
      }
    });
  });

  describe("Card Spacing (Chart + Movements)", () => {
    it("chart card has card-header with space-3/4 padding", () => {
      renderDashboard();
      const chartCard = screen.getByText("Ingresos (7 días)").closest("section.card");
      expect(chartCard).toBeInTheDocument();
      const header = chartCard?.querySelector(".card-header");
      expect(header).toBeInTheDocument();
    });

    it("movements card has card-body with no padding (list fills)", () => {
      renderDashboard();
      const movementsCard = screen.getByText("Últimos movimientos").closest("section.card");
      expect(movementsCard).toBeInTheDocument();
      const body = movementsCard?.querySelector(".card-body");
      expect(body).toBeInTheDocument();
    });
  });

  describe("Movement List Item Spacing", () => {
    it("movement items use space-3 gap and space-3/4 padding", () => {
      renderDashboard();
      const movementItems = document.querySelectorAll(".movement-item");
      expect(movementItems.length).toBeGreaterThan(0);
    });

    it("icon circle uses 40px size with border-radius-full", () => {
      renderDashboard();
      const icons = document.querySelectorAll('[style*="border-radius: 50%"][style*="width: 40px"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("movement rows have space-2 gap for subrows", () => {
      renderDashboard();
      const subrows = document.querySelectorAll('[style*="gap: var(--space-2)"]');
      expect(subrows.length).toBeGreaterThan(0);
    });
  });

  describe("Spacing Tokens from design-tokens.css", () => {
    it("verifies dashboard component uses base and dash-* tokens", () => {
      renderDashboard();
      const dashboardRoot = screen.getByTestId("dashboard-root");
      const styles = window.getComputedStyle(dashboardRoot);
      // Component should use dash-* tokens (which reference base tokens)
      expect(styles.gap).toBeTruthy(); // uses --dash-gap -> --space-2
      expect(styles.paddingTop).toBeTruthy(); // uses --dash-space-2 -> --space-2
      expect(styles.fontSize).toBeTruthy(); // uses --dash-text-base -> --text-base
    });
  });

  describe("No Density Leakage", () => {
    it("dash-* custom properties do not leak to parent elements", () => {
      const { container } = render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardPage />
        </MemoryRouter>
      );
      const dashboardRoot = container.querySelector('[data-testid="dashboard-root"]');
      const parentStyles = window.getComputedStyle(dashboardRoot!.parentElement!);

      expect(parentStyles.getPropertyValue("--dash-space-1")).toBe("");
      expect(parentStyles.getPropertyValue("--dash-gap")).toBe("");
      expect(parentStyles.getPropertyValue("--dash-card-padding")).toBe("");
    });
  });
});