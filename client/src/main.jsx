import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Global error handlers to catch any unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  document.body.innerHTML = '<pre style="color:red;padding:20px;font-family:monospace">' + 
    'Global Error: ' + (event.error?.message || event.message) + 
    '\nStack: ' + (event.error?.stack || 'no stack') + '</pre>';
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  document.body.innerHTML = '<pre style="color:red;padding:20px;font-family:monospace">' + 
    'Unhandled Rejection: ' + (event.reason?.message || event.reason) + 
    '\nStack: ' + (event.reason?.stack || 'no stack') + '</pre>';
});

console.log('main.jsx executing...');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log('QueryClient created, rendering App...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

console.log('Render call completed');
