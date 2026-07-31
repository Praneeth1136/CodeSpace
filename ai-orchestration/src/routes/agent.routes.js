import { Router } from "express"    ;
import agent from "../agents/code.agent.js";

const agentRouter  = Router();

agentRouter.post("/invoke",async(req,res)=>{
    try{
        const{message, sandboxId} = req.body;
        const response = await agent.invoke({messages : [{
            role:"user",
            content: `[Sandbox ID: ${sandboxId || "none"}]\n\n${message}`,
        }]});
        console.log(response);
        res.json({response});

    }catch(error){
        console.log("Error invoking agent:",error);
         // Check if it's a rate limit or timeout error to return a more helpful status
    if (error.name === 'TimeoutError' || error.message.includes('429')) {
        return res.status(429).json({ error: "AI provider rate limit exceeded or timed out. Please try again in a minute." });
    }
        res.status(500).json({error:"Internal Server Error"});
    }
});

export default agentRouter;