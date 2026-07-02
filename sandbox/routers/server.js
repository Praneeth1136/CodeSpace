import app from "./src/app.js";
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');


app.use(morgan('combined'))


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


app.use((req,res,next) =>{
    const host = req.headers.host;

    if(host.includes("agent")){
        const sandboxId = host.split('.')[0];
        return getAgentProxy(sandboxId)(req,res,next);
    }else if(host.includes("preview")){
        const sandboxId = host.split('.')[0];
        return getProxy(sandboxId)(req,res,next);
    }
})

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId){
    const target = `http://sandbox-service-${sandboxId}`

    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target:target,
            changeOrigin:true,
            ws:true
        })
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId){
    const target = `http://sandbox-service-${sandboxId}:3000`

    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target:target,
            changeOrigin:true,
            ws:true
        })
    }
    return agentProxies[sandboxId];
}





app.listen(3000,()=>{
    console.log("Router is running on port 3000")
})