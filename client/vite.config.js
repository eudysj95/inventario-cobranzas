import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Client is served as static files by the Express server in production
// (single Render service, same origin). Dev server proxies API calls.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
  build: {
    outDir: 'dist',
  },
});
