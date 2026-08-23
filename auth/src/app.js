import express from "express";
import pinoHttp from "pino-http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(pinoHttp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://www.praneethkilaparthi.dev/api/auth/google/callback",
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent"
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
}));
app.get("/_status/healthz", (req, res) => {
    res.status(200).json({
        status: "ok"
    })
})

app.use("/api/auth", authRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    req.log.error(err);
    res.status(err.status || 500).json({
        error: "Internal Server Error"
    });
});

export default app;
