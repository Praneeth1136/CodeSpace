import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import sandboxRouter from "./routes/sandbox.routes.js";

const app = express();


app.use(express.json());
app.use(pinoHttp());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());


import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "./config/redis.js";

app.use(cors());

const sandboxRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute)
    message: "Too many requests from this IP, please try again after a minute"
});

const sandboxCreateRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 pod creation requests per minute
    message: "Too many sandbox creation requests, please try again later"
});


app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({ message: "Sandbox API is healthy" });
});

app.use('/api/sandbox/start', sandboxCreateRateLimiter);
app.use('/api/sandbox', sandboxRateLimiter, sandboxRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    // Log the full error and stack trace securely
    req.log.error(err);
    
    // Return a generic sanitized message to the client
    res.status(err.status || 500).json({
        error: "Internal Server Error"
    });
});

export default app;