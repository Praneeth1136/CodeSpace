import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: "http://localhost:5173/api/auth/google/callback",
    callbackURL: "https://www.praneethkilaparthi.dev/api/auth/google/callback",
    scope: ["profile", "email"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));
app.get("/_status/healthz", (req, res) => {
    res.status(200).json({
        status: "ok"
    })
})

app.use("/api/auth", authRoutes);

export default app;
