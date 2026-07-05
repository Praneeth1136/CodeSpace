import express from "express";

import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(morgan('dev'));

app.get("/healthz",(req,res)=>{
    res.json(200).statusMessage("ok");
})


export default app;