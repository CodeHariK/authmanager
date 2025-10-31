import { createClient } from "redis";
import { env } from "../src/env";
import { pool } from "../src/db";

async function clear_db() {
	console.warn("DROPPING SCHEMA public CASCADE ...");
	await pool.query("DROP SCHEMA IF EXISTS public CASCADE;");
	console.warn("RECREATING SCHEMA public ...");
	await pool.query("CREATE SCHEMA public;");
	await pool.query("GRANT ALL ON SCHEMA public TO public;");

	console.warn("DROPPING SCHEMA drizzle CASCADE (if exists)...");
	await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE;");
	console.warn("RECREATING SCHEMA drizzle ...");
	await pool.query("CREATE SCHEMA drizzle;");
	await pool.query("GRANT ALL ON SCHEMA drizzle TO public;");

	console.log("Done.");
	await pool.end();
}

clear_db().catch(async (err) => {
	console.error("Drop failed:", err);
	await pool.end();
	process.exit(1);
});

const redisClient = createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    }
});

async function clear_redis() {
    try {
        console.log("Connecting to Redis...");
        await redisClient.connect();
        console.log("✅ Connected to Redis");

        console.log("Clearing Redis cache...");
        await redisClient.flushDb();
        console.log("✅ Redis cache cleared successfully");

        const dbsize = await redisClient.dbSize();
        console.log(`📦 Remaining keys: ${dbsize}`);
    } catch (err) {
        console.error("❌ Failed to clear Redis cache:", err);
        process.exit(1);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("✅ Disconnected from Redis");
        }
    }
}

clear_redis();
