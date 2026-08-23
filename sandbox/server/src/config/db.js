import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("MongoDB connected successfully");

        mongoose.connection.on('disconnected', () => {
            console.error('MongoDB disconnected! Attempting to reconnect...');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
