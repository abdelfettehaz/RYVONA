import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      'ryvona-uyex.onrender.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost',
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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'swiper'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'fabric-vendor': ['fabric'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'color-vendor': ['react-color'],
          'icons-vendor': ['lucide-react', 'react-icons'],
          'utils-vendor': ['axios', 'react-hot-toast', 'react-toastify']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
