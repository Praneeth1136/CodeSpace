import app from "./src/app.js";
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware";


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

const proxies = {};

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

app.use((req,res,next) =>{
    const host = req.headers.host;
    if (!host) {
        return res.status(400).send('Host header is required');
    }
    const sandboxId = host.split('.')[0];

    return getProxy(sandboxId)(req,res,next);
})

app.listen(3000,()=>{
    console.log("Router is running on port 3000")
})