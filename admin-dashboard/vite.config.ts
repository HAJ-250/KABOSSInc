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
server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://kabossimage-api.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://kabossimage-api.onrender.com',
        changeOrigin: true,
        ws: true,
      },
      '/uploads': {
        target: 'https://kabossimage-api.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
