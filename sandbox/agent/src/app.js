import express from "express";
import morgan from "morgan";
import fs from "fs";

const app = express();

const WORKING_DIR = "/workspace"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req,res) => {
    res.send("Agent is running");
});

app.get('/list-files',async(req,res)=>{
    const elements = await fs.promises.readdir(WORKING_DIR);
    res.status(200).json({
        message:'Element is running in WORKDIR directory',
        elements:elements
    })
})

export default app;
