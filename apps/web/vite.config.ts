// Vite config: React plugin, and /api proxied to the Go API in dev so the app and API share one origin (cookies).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = process.env.MONETA_API_URL ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': API_URL },
  },
});
