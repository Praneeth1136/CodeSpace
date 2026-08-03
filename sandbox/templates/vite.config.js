import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    allowedHosts: true,

    hmr: {
      protocol: 'ws',
      clientPort: 80
    },
    watch: {
    usePolling: true,
    interval: 300,
    ignored: ['node_modules']
  }
  },

  
})