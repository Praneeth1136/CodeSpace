import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };
        const connection = await mongoose.connect(process.env.AUTH_MONGO_URI, options);
        console.log(`MongoDB connected: ${connection.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            console.error('MongoDB disconnected! Attempting to reconnect...');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
