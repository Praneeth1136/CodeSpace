import Redis from "ioredis";
import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

export async function createSandboxkey(sandboxId) {
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: "active"
    }), "EX", 1200)
}

subscriber.config('SET', 'notify-keyspace-events', 'Ex');

subscriber.subscribe('__keyevent@0__:expired')

subscriber.on('message', async (channel, message) => {
    console.log(`Key Expires:${message}`);

    const sandboxId = message.split(":")[1];
    console.log(sandboxId);

    const podResponse = await deletePod(sandboxId);
    const serviceResponse = await deleteService(sandboxId);
})


export { redis, subscriber }