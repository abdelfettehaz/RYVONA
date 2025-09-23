import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // This should be '/' for root domain deployment
  server: {
    port: 5173,
    host: true, // Allow external access if needed
    // Remove the proxy section for production deployment
    // Proxy is only needed for development
    /*
    proxy: {
      '/api': {
        target: 'https://ryvona.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/project/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
    */
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to false for production for better performance
    minify: 'terser', // Enable minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      }
    }
  },
  // Add preview configuration for testing production build
  preview: {
    port: 4173,
    host: true
  }
})
