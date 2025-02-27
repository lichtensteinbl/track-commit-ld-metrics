import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5137,
    proxy: {
      '/api': {
        target: 'http://localhost:2000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
