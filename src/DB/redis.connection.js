import { createClient } from "redis";
import { REDIS_URI } from "../config.js";

export const client = createClient({
    url: REDIS_URI
});

export async function connectRedis() {
    try {
        await client.connect();
        console.log(`Redis connection establish successfully`);
    } catch (error) {
        console.log(`Fail to establish Redis connection`);
    }
}