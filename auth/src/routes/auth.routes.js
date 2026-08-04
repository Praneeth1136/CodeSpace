import {Router} from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import passport from "passport";
const router = Router();

router.get("/google",passport.authenticate("google",{
    scope:["profile","email"],
    session: false
}));

router.get("/google/callback",passport.authenticate("google",{
    failureRedirect:"http://localhost:5173",
    session: false
}),async(req,res)=>{
    try{
        const{id,displayName,emails,photos} = req.user;

        let user = await User.findOne({googleId:id});

        if(!user){
            user = await User.create({
                googleId:id,
                displayName,
                email:emails[0].value,
                photoUrl:photos[0].value
            });
            await user.save();
            
        }
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:60 * 60 * 1000
        });
        res.redirect("http://localhost:5173");
    }catch(error){
        console.log(error);
        res.redirect("http://localhost:5173");
    }
});

router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("http://localhost:5173");
});

export default router;