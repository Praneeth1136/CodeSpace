import Redis from "ioredis";
import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL);

// Pods expire after 20 minutes (1200000 ms) of inactivity
const POD_TIMEOUT_MS = 1200000;

export async function createSandboxkey(sandboxId) {
    const expiresAt = Date.now() + POD_TIMEOUT_MS;
    await redis.zadd('sandbox_expirations', expiresAt, sandboxId);
    
    // Optional: Keep the state key if it's used elsewhere, but without EX
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: "active"
    }));
}

export function startPodCleanupCron() {
    console.log("Starting Pod Cleanup CronJob...");
    
    // Poll every 60 seconds
    setInterval(async () => {
        try {
            const now = Date.now();
            
            // Find all sandboxIds where the score (expiration time) is <= now
            const expiredSandboxes = await redis.zrangebyscore('sandbox_expirations', 0, now);
            
            if (expiredSandboxes.length > 0) {
                console.log(`Found ${expiredSandboxes.length} expired sandboxes. Cleaning up...`);
            }
            
            for (const sandboxId of expiredSandboxes) {
                console.log(`Cleaning up expired sandbox: ${sandboxId}`);
                
                try {
                    await deletePod(sandboxId);
                    await deleteService(sandboxId);
                    
                    // Cleanup Redis keys
                    await redis.del(`sandbox:${sandboxId}`);
                    await redis.zrem('sandbox_expirations', sandboxId);
                    
                    console.log(`Successfully cleaned up sandbox: ${sandboxId}`);
                } catch (err) {
                    // If it's a 404 (Not Found), the pod/service is already gone, so we should clean up Redis to avoid infinite loops
                    if (err.response && err.response.statusCode === 404) {
                        console.log(`Sandbox ${sandboxId} already deleted from cluster. Cleaning up Redis.`);
                        await redis.del(`sandbox:${sandboxId}`);
                        await redis.zrem('sandbox_expirations', sandboxId);
                    } else {
                        console.error(`Error cleaning up sandbox ${sandboxId} (will retry):`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error("Error in Pod Cleanup CronJob:", error);
        }
    }, 60000);
}

export { redis };