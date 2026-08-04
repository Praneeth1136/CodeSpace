import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.AUTH_MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
