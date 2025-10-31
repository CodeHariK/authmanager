import { createClient } from "redis";
import { env } from "@/env";

interface SecondaryStorage {
    get: (key: string) => Promise<unknown>; 
    set: (key: string, value: string, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

const redisClient = createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    }
});

let isReconnecting = false;

async function connectWithRetry(isInitial = false): Promise<boolean> {
    const maxRetries = 5;
    let retryInterval = 1000; // Start with 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
                console.log(isInitial ? '✅ Redis connected successfully' : '✅ Redis reconnected successfully');
                isReconnecting = false;
                return true;
            }
        } catch (err) {
            console.error(`❌ Redis connection attempt ${attempt}/${maxRetries} failed:`, err);
            
            if (attempt === maxRetries) {
                if (isInitial) {
                    console.error('❌ Failed to connect to Redis after all retries. Exiting...');
                    process.exit(1);
                }
                console.error('❌ Failed to reconnect to Redis after all retries.');
                isReconnecting = false;
                return false;
            }
            
            // Wait with increasing interval before retry
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
            retryInterval *= 2; // Double the interval each time (1s, 2s, 4s, 8s)
        }
    }
    return false;
}

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('end', () => {
    console.warn('Redis connection ended. Attempting to reconnect...');
    if (!isReconnecting) {
        isReconnecting = true;
        connectWithRetry(false);
    }
});

// Initialize Redis connection with retries and increasing intervals
connectWithRetry(true);

async function ensureConnected(): Promise<void> {
    const timeout = 5000; // 5 seconds total timeout
    const startTime = Date.now();
    
    if (!redisClient.isOpen && !isReconnecting) {
        isReconnecting = true;
        connectWithRetry(false).catch(() => {
            // Reconnection failed, will be handled by timeout check
        });
    }
    
    // Wait for connection with timeout
    while ((isReconnecting || !redisClient.isOpen) && (Date.now() - startTime) < timeout) {
        if (redisClient.isOpen) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    if (!redisClient.isOpen) {
        const error = new Error('Redis connection unavailable: timeout waiting for connection');
        console.error('❌', error.message);
        throw error;
    }
}

export const secondaryStorage: SecondaryStorage = {
    get: async (key) => {
        try {
            await ensureConnected();
            return await redisClient.get(key);
        } catch (err) {
            console.error('❌ Redis get operation failed:', err);
            throw err;
        }
    },
    set: async (key, value, ttl) => {
        try {
            await ensureConnected();
            // TTL in seconds — convert ms with ttl * 1000.
            if (ttl) await redisClient.set(key, value, { EX: ttl });
            // or for ioredis:
            // if (ttl) await redis.set(key, value, 'EX', ttl)
            else await redisClient.set(key, value);
        } catch (err) {
            console.error('❌ Redis set operation failed:', err);
            throw err;
        }
    },
    delete: async (key) => {
        try {
            await ensureConnected();
            await redisClient.del(key);
        } catch (err) {
            console.error('❌ Redis delete operation failed:', err);
            throw err;
        }
    }
};
