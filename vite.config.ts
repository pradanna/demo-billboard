import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Listen on all network interfaces for local & client network sharing
    port: 5180,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5180,
    strictPort: true,
  }
});
