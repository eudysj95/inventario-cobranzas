import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Get the initial theme from localStorage or default to 'system'
 */
function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme-preference') as Theme) || 'system';
  }
  return 'system';
}

/**
 * Apply the resolved theme to the document element
 */
function applyTheme(resolved: 'light' | 'dark'): void {
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
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', newTheme);
    }
  }, []);

  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark';
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      setResolvedTheme(resolved);
      applyTheme(resolved);

      // Inject tenant dark palette when in dark mode
      if (resolved === 'dark' && tenantDarkPalette) {
        injectTenantDarkPalette(tenantDarkPalette);
      }
    };

    updateResolvedTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    // Use addEventListener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener?.(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener?.(handleChange);
      }
    };
  }, [theme, tenantDarkPalette]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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

  const stored = localStorage.getItem('theme-preference') as Theme | null;
  const theme = stored || 'system';

  let resolved: 'light' | 'dark';
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolved = theme;
  }

  applyTheme(resolved);

  if (resolved === 'dark' && tenantDarkPalette) {
    injectTenantDarkPalette(tenantDarkPalette);
  }
}