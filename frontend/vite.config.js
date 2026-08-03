import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function sandboxHostPlugin() {
  return {
    name: 'sandbox-host-plugin',
    configureServer(server) {
      server.httpServer.on('upgrade', (req, socket, head) => {
        if (req.url.startsWith('/socket.io-agent')) {
          try {
            const url = new URL(req.url, 'http://127.0.0.1');
            const sandboxId = url.searchParams.get('sandboxId');
            if (sandboxId) {
              req.headers['host'] = `${sandboxId}.agent.localhost`;
            }
          } catch (e) {
            // ignore
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sandboxHostPlugin()],
  server: {
    cors: {
      origin: "*"
    },
    proxy: {
      // Sandbox server API (create sandbox, health, etc.)
      '/api/sandbox': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => path, // keep /api/sandbox/start as-is
      },
      // REST API — forwarded to the backend/ingress
      "/api": {
        target: "http://127.0.0.1",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      // AI orchestration API
      '/api/ai': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      // Agent API proxy — rewrites /agent/{sandboxId}/xxx to /xxx
      // and sets the Host header to {sandboxId}.agent.localhost
      '/agent': {
        target: 'http://127.0.0.1',
        bypass: (req) => {
          const match = req.url.match(/^\/agent\/([^/]+)(\/.*)?$/);
          if (match) {
            const sandboxId = match[1];
            req.headers['host'] = `${sandboxId}.agent.localhost`;
          }
        },
        rewrite: (path) => {
          // /agent/{sandboxId}/list-files -> /list-files
          return path.replace(/^\/agent\/[^/]+/, '');
        },
      },
      // Socket.IO proxy for terminal WebSocket
      '/socket.io-agent': {
        target: 'http://127.0.0.1',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err, req) => {
            console.error('[Vite Proxy Error WS]', err.message, req.url);
          });
        },
        rewrite: (path) => {
          // Remove /socket.io-agent prefix, keep the rest
          return path.replace(/^\/socket\.io-agent/, '/socket.io');
        },
      },
    },
    host: true,
    port: 5173
  }
})
