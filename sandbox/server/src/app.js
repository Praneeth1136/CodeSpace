import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import sandboxRouter from "./routes/sandbox.routes.js";

const app = express();


app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());


app.use(cors());


app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({ message: "Sandbox API is healthy" });
});

app.use('/api/sandbox', sandboxRouter);


export default app;