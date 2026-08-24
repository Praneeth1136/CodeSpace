import {Router} from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import { sendAuthNotification } from "../config/mq.js";
const router = Router();

router.get("/google",passport.authenticate("google",{
    scope:["profile","email"],
    accessType: "offline",
    prompt: "consent",
    session: false 
}));

router.get("/google/callback",passport.authenticate("google",{
    failureRedirect:"https://www.praneethkilaparthi.dev",
    session: false
}),async(req,res)=>{
    try{
        const{id,displayName,emails,photos,refreshToken} = req.user;

        let user = await User.findOne({googleId:id});

        if(!user){
            user = await User.create({
                googleId:id,
                displayName,
                email:emails[0].value,
                photoUrl:photos[0].value,
                ...(refreshToken && { refreshToken })
            });
            await user.save();
        } else if (refreshToken) {
            user.refreshToken = refreshToken;
            await user.save();
        }

        await sendAuthNotification({
            userId:user._id,
            action:'google_login',
            timestamp:new Date(),
            email:emails[0].value,
            ip:req.ip
        });

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:60 * 60 * 1000
        });
        res.redirect("https://www.praneethkilaparthi.dev");
    }catch(error){
        console.log(error);
        res.redirect("https://www.praneethkilaparthi.dev");
    }
});

router.get("/me", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("displayName email photoUrl");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: {
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                photoUrl: user.photoUrl
            }
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});

router.get("/logout",(req,res)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });
    res.redirect("https://www.praneethkilaparthi.dev");
});

export default router;