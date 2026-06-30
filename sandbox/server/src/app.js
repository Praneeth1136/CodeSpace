import express from "express";
import cors from "cors";
import morgan from "morgan";

import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
import { v7 as uuidv7 } from "uuid";

const app = express();


app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}))


app.use(cors());


app.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({ message: "Sandbox API is healthy" });
});

app.post("/api/sandbox/start",async(req,res)=>{
    const sandboxId = uuidv7();
    try{
        const pod = await createPod(sandboxId);
        const service = await createService(sandboxId);

        res.status(200).json({
            message:"   Container Created successfully",
            sandboxId,
            // service,
            previewUrl:`http://${sandboxId}.preview.localhost`
        })
    }
    catch(error){
        res.status(500).json({message:"Internal server error"})
    }
    
})
export default app;