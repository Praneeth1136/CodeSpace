import jwt from "jsonwebtoken";

export function verifyToken(token){
    try {
        return jwt.verify(token,process.env.JWT_SECRET)
    } catch (error) {
        console.log("Token verification failed",error)
        return null;
    }
}