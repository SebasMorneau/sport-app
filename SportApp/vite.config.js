import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: '0.0.0.0',
    // Reduce file watching to prevent EMFILE errors
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/android/**', '**/ios/**'],
    },
  },
  build: {
    outDir: 'android/app/src/main/assets',
    rollupOptions: {
      input: 'index.js',
      output: {
        entryFileNames: 'index.android.bundle',
        format: 'iife',
      },
    },
  },
});
