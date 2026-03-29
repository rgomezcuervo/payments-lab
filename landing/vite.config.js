import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      '596d-186-28-168-110.ngrok-free.app' // Allow a specific hostname
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
