import express from "express";
import agentRouter from "./routes/agent.routes.js"

import pinoHttp from "pino-http";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use pino-http for structured JSON request logging
app.use(pinoHttp());

import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

// Only connect to Redis if the URL is provided (it might not be during local testing or build)
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
}

const aiRateLimiter = rateLimit({
    store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }) : undefined,
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 AI invocations per minute
    message: { error: "Too many AI requests from this IP, please try again after a minute" }
});

app.get("/healthz", (req, res) => {
    res.status(200).send("ok");
})


app.use("/api/ai", aiRateLimiter, agentRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    // Log the full error securely
    req.log.error(err);
    
    // Return sanitized message
    res.status(err.status || 500).json({
        error: "Internal Server Error"
    });
});

export default app;