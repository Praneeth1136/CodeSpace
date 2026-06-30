import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();


app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}))


app.use(cors());


app.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({ message: "Sandbox API is healthy" });
});

export default app;