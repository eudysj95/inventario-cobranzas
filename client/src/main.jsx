import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider, initializeTheme } from './hooks/useTheme';

// Design system (global styles)
import './styles/design-tokens.css';
import './styles/utilities.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Feature flag: VITE_TOAST=true enables toast system; false/default = noop (zero bundle impact)
const enableToast = import.meta.env.VITE_TOAST === 'true';

// Initialize theme early to prevent flash (before React render)
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {enableToast ? (
            <ToastProvider>
              <App />
            </ToastProvider>
          ) : (
            <App />
          )}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);