import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startPodCleanupCron } from "./src/config/redis.js";

connectDB();
startPodCleanupCron();

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});