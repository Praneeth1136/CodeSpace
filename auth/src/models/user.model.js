import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId:{
        type:String,
        required:true
    },
    displayName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    photoUrl:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
},{
    timestamps:true
});

const User = mongoose.model("user",userSchema);

export default User;