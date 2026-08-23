import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('Connected to Redis successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export async function refreshTTL(sandboxId) {
    const expiresAt = Date.now() + 1200000;
    await redis.zadd('sandbox_expirations', expiresAt, sandboxId);
    
    // Also keep the existing expire for legacy fallback
    await redis.expire(`sandbox:${sandboxId}`, 60 * 20);
}