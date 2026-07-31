import express from "express";
import agentRouter from "./routes/agent.routes.js"

import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.get("/healthz", (req, res) => {
    res.status(200).send("ok");
})


app.use("/api/ai", agentRouter);

export default app;