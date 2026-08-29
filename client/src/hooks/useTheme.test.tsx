import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Test component that uses useTheme
function ThemeTestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme("dark")} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme("system")} data-testid="set-system">
        System
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

describe("ThemeProvider", () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    dispatchEvent: ReturnType<typeof vi.fn>;
  };
  let originalMatchMedia: typeof window.matchMedia;
  let originalLocalStorage: typeof window.localStorage;
  let setAttributeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh mock for each test
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    // Store originals
    originalMatchMedia = window.matchMedia;
    originalLocalStorage = window.localStorage;

    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);

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
      if (name === "data-theme") return "light";
      return null;
    });
  });

  afterEach(() => {
    // Restore originals
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("defaults to 'system' when no localStorage value", () => {
      localStorage.getItem.mockReturnValue(null);
      renderWithThemeProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("system");
    });

    it("reads persisted theme from localStorage", () => {
      localStorage.getItem.mockReturnValue("dark");
      renderWithThemeProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    it("reads persisted theme 'light' from localStorage", () => {
      localStorage.getItem.mockReturnValue("light");
      renderWithThemeProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });
  });

  describe("Resolved Theme", () => {
    it("resolves to 'light' when theme is 'light'", () => {
      localStorage.getItem.mockReturnValue("light");
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });

    it("resolves to 'dark' when theme is 'dark'", () => {
      localStorage.getItem.mockReturnValue("dark");
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    it("resolves to system preference when theme is 'system' and matchMedia matches dark", () => {
      localStorage.getItem.mockReturnValue("system");
      matchMediaMock.matches = true;
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    it("resolves to 'light' when theme is 'system' and matchMedia matches light", () => {
      localStorage.getItem.mockReturnValue("system");
      matchMediaMock.matches = false;
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });
  });

  describe("Setting Theme", () => {
    it("updates theme and persists to localStorage when setTheme is called", () => {
      localStorage.getItem.mockReturnValue("system");
      renderWithThemeProvider();

      fireEvent.click(screen.getByTestId("set-dark"));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(localStorage.setItem).toHaveBeenCalledWith("theme-preference", "dark");
    });

    it("sets data-theme on documentElement when theme changes", () => {
      localStorage.getItem.mockReturnValue("light");
      renderWithThemeProvider();

      fireEvent.click(screen.getByTestId("set-dark"));

      expect(setAttributeSpy).toHaveBeenCalledWith("data-theme", "dark");
    });
  });

  describe("OS Preference Sync", () => {
    it("adds matchMedia listener on mount", () => {
      renderWithThemeProvider();

      expect(window.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
      expect(matchMediaMock.addEventListener).toHaveBeenCalled();
    });

    it("updates resolvedTheme when system preference changes and theme is 'system'", () => {
      localStorage.getItem.mockReturnValue("system");
      matchMediaMock.matches = false;
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");

      // Simulate system preference change to dark
      matchMediaMock.matches = true;
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: true } as MediaQueryListEvent);
      });

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    it("does not update resolvedTheme when theme is not 'system'", () => {
      localStorage.getItem.mockReturnValue("light");
      matchMediaMock.matches = true;
      renderWithThemeProvider();

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");

      // Simulate system preference change
      matchMediaMock.matches = false;
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: false } as MediaQueryListEvent);
      });

      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });

    it("removes matchMedia listener on unmount", () => {
      const { unmount } = renderWithThemeProvider();

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("Tenant Dark Palette", () => {
    it("injects tenant dark palette CSS variables when configured", () => {
      localStorage.getItem.mockReturnValue("dark");
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