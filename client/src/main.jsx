import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Immediate visual test - runs after imports, before React
document.body.style.background = '#fff';
const testDiv = document.createElement('div');
testDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;height:50px;background:blue;color:white;z-index:99999;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;';
testDiv.textContent = '✅ JavaScript ejecutándose - main.jsx cargado';
document.body.appendChild(testDiv);

// Also show alert to verify execution
setTimeout(() => {
  alert('✅ main.jsx ejecutándose en el navegador');
}, 100);

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
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </RootErrorBoundary>
  </StrictMode>
);

console.log('Render call completed');
