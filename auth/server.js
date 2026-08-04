import app from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";

connectDB();

dotenv.config();

const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});