import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Agent modules as separate chunks for lazy loading
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@reduxjs') || id.includes('redux')) return 'redux';
            return 'vendor';
          }
          if (id.includes('/modules/financial-advisor/')) return 'module-financial-advisor';
        },
      },
    },
  },
});
