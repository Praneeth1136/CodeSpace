import app from "./src/app.js";
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');
import http from 'http';
import { createProxyServer } from 'httpxy';
// import { refreshTTL } from './config/redis.js';


app.use(morgan('combined'));
const HEALTH_CHECK_PATHS = new Set([
  "/_status/healthz",
  "/api/status/healthz",
  "/api/status/readyz",
  "/api/sandbox/health",
]);

app.use(
  morgan("dev", {
    skip: (req) =>
      HEALTH_CHECK_PATHS.has(req.path) ||
      req.get("user-agent")?.startsWith("kube-probe"),
  })
);



app.get("/api/status/healthz",(req,res)=>{
    res.status(200).json({
        status:'ok'
    })
})

app.get("/api/status/readyz",(req,res)=>{
    res.status(200).json({
        status:'ok'
    })
})


const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:80`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true
        });
    }

    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true
        });
    }

    return agentProxies[sandboxId];
}


// Single httpxy proxy server for all WebSocket upgrades
const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on('error', (err, req, socket) => {
    console.error('WS proxy error:', err.message);
    socket?.destroy();
});

app.use(async (req, res, next) => {
    const host = req.headers.host;
    if(!host) return next();
    
    const sandboxId = host.split('.')[ 0 ];

    if (host.includes('agent')) {
        return getAgentProxy(sandboxId)(req, res, next);
    } else if (host.includes('preview')) {
        return getProxy(sandboxId)(req, res, next);
    } else {
        next();
    }
});

// Create the HTTP server explicitly
const server = http.createServer(app);

// server.on('upgrade', (req, socket, head) => {
//     const host = req.headers.host;
//     if (!host) { socket.destroy(); return; }

//     // Prevent EPIPE and connection-reset errors from crashing the process
//     // during the active piped session (after ws() Promise has resolved)
//     socket.on('error', () => socket.destroy());

//     const sandboxId = host.split('.')[ 0 ];
//     let type = '';
    
//     if (host.includes('agent')) type = 'agent';
//     else if (host.includes('preview')) type = 'preview';

//     console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

//     if (type === 'agent') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
//             .catch(() => socket.destroy());
//     } else if (type === 'preview') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
//             .catch(() => socket.destroy());
//     } else {
//         socket.destroy();
//     }
// });

server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host;

    if (!host) {
        socket.destroy();
        return;
    }

    const sandboxId = host.split('.')[0];

    let target;

    if (host.includes('.agent.')) {
        target = `http://sandbox-service-${sandboxId}:3000`;
    } 
    else if (host.includes('.preview.')) {
        target = `http://sandbox-service-${sandboxId}:80`;
    } 
    else {
        socket.destroy();
        return;
    }

    console.log(
        `WS upgrade: ${host} -> ${target}`
    );

    wsProxy.ws(
        req,
        socket,
        {
            target,
            changeOrigin: true
        },
        head
    );
});

export default server; // export server, not app

server.listen(3000,()=>{
    console.log("Router is running on port 3000")
})