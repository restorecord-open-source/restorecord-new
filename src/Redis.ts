import Redis, { RedisOptions } from "ioredis";

function getRedisConfiguration(): { port: number; host: string; } {
    return {
        port: 6379,
        host: "127.0.0.1",
    }
}

export function createRedisInstance(config = getRedisConfiguration()) {
    try {
        const platform = process.env.PLATFORM || "PRODUCTION";

        if (platform === "TESTING") {
            return {
                get: async () => null,
                set: async () => {},
                del: async () => {},
            };
        }

        const options: RedisOptions = {
            host: config.host,
            lazyConnect: true,
            showFriendlyErrorStack: true,
            enableAutoPipelining: true,
            maxRetriesPerRequest: 0,
            retryStrategy: (times: number) => {
                if (times > 10) {
                    throw new Error(`[Redis] Could not connect after ${times} attempts`);
                }

                return Math.min(times * 200, 1000);
            },
        };

        if (config.port) {
            options.port = config.port;
        }

        const redis = new Redis(options);

        redis.on("error", (error: unknown) => {
            console.warn("[Redis] Error connecting", error);
        });

        return redis;
    } catch (e) {
        throw new Error(`[Redis] Could not create a Redis instance`);
    }
}