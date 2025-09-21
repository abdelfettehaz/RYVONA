import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'http://php-apache:80' 
          : 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
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
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'react-icons', 'lucide-react'],
          'canvas-vendor': ['fabric', 'html2canvas'],
          'pdf-vendor': ['jspdf'],
          'color-vendor': ['react-color'],
          // Page chunks
          'pages-admin': [
            './src/pages/Admin.tsx',
            './src/pages/AdminDashboard.tsx',
            './src/pages/AdminChat.tsx',
            './src/pages/OrderAdmin.tsx'
          ],
          'pages-design': [
            './src/pages/DesignStudio.tsx',
            './src/pages/MyDesigns.tsx',
            './src/pages/Gallery.tsx',
            './src/pages/Templates.tsx'
          ],
          'pages-user': [
            './src/pages/Login.tsx',
            './src/pages/SignUp.tsx',
            './src/pages/Profile.tsx',
            './src/pages/Orders.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}) 