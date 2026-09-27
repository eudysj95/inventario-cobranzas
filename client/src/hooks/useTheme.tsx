import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/** Theme is locked to dark mode — no user toggle */
type Theme = 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Apply the resolved theme to the document element
 */
function applyTheme(resolved: 'dark'): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
  }
}

/**
 * Inject tenant dark palette CSS variables
 */
function injectTenantDarkPalette(palette?: Record<string, string>): void {
  if (typeof document === 'undefined' || !palette) return;

  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--brand-dark-${key}`, value);
  });
}

export function ThemeProvider({
  children,
  tenantDarkPalette,
}: {
  children: React.ReactNode;
  tenantDarkPalette?: Record<string, string>;
}) {
  const [resolvedTheme] = useState<'dark'>('dark');

  const setTheme = useCallback((_newTheme: Theme) => {
    // No-op: theme is locked to dark
  }, []);

  useEffect(() => {
    applyTheme('dark');
    if (tenantDarkPalette) {
      injectTenantDarkPalette(tenantDarkPalette);
    }
  }, [tenantDarkPalette]);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' as Theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Initialize theme early (before React render) to prevent flash
 * Call this in main.jsx before createRoot().render()
 */
export function initializeTheme(tenantDarkPalette?: Record<string, string>): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  applyTheme('dark');
  if (tenantDarkPalette) {
    injectTenantDarkPalette(tenantDarkPalette);
  }
}