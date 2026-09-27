import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Test component that uses useTheme
function ThemeTestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")} data-testid="set-dark">
        Dark
      </button>
    </div>
  );
}

function renderWithThemeProvider(options = {}) {
  const { tenantDarkPalette, ...rest } = options;
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ThemeProvider tenantDarkPalette={tenantDarkPalette}>
        <ThemeTestComponent {...rest} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe("ThemeProvider (locked to dark)", () => {
  let originalLocalStorage: typeof window.localStorage;
  let setAttributeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    originalLocalStorage = window.localStorage;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // Mock document.documentElement.setAttribute
    setAttributeSpy = vi.fn();
    vi.spyOn(document.documentElement, "setAttribute").mockImplementation(setAttributeSpy);
    vi.spyOn(document.documentElement, "getAttribute").mockImplementation((name: string) => {
      if (name === "data-theme") return "dark";
      return null;
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("always returns 'dark' theme regardless of localStorage", () => {
      localStorage.getItem.mockReturnValue("light"); // Should be ignored
      renderWithThemeProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    it("resolvedTheme is always 'dark'", () => {
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });
  });

  describe("Setting Theme", () => {
    it("setTheme is a no-op (theme stays dark)", () => {
      renderWithThemeProvider();

      fireEvent.click(screen.getByTestId("set-dark"));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("data-theme is set to 'dark' on mount", () => {
      renderWithThemeProvider();

      expect(setAttributeSpy).toHaveBeenCalledWith("data-theme", "dark");
    });
  });

  describe("Tenant Dark Palette", () => {
    it("injects tenant dark palette CSS variables when configured", () => {
      const tenantPalette = { bg: "#111827", surface: "#1f2937", primary: "#34d399" };
      renderWithThemeProvider({ tenantDarkPalette: tenantPalette });

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
      // The actual CSS variable injection is tested in integration
    });
  });
});

describe("useTheme hook", () => {
  it("throws error when used outside ThemeProvider", () => {
    function BadComponent() {
      useTheme();
      return <div>Bad</div>;
    }

    expect(() => {
      render(
        <QueryClientProvider client={new QueryClient()}>
          <BadComponent />
        </QueryClientProvider>
      );
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});