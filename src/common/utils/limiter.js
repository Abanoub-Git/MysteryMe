import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import geoip from 'geoip-lite'
import { client } from '../../DB/redis.connection.js';
import { successResponse } from './success.response.js';


async function fromWhere(ip) {
    try {
        return geoip.lookup(ip);
    } catch (error) {
        console.log('Fail to detect request origin');
        console.log(error);
    }
}
class RedisRateLimitStore {
    constructor(ttlMinutes) {
        this.windowMs = ttlMinutes * 60 * 1000;
    }

    init(options) {
        if (options && options.windowMs) {
            this.windowMs = options.windowMs;
        }
    }

    async get(key) {
        try {
            const raw = await client.get(key);
            if (!raw) return undefined;
            const remainingTtl = await client.ttl(key);
            const resetTime = remainingTtl > 0 ? new Date(Date.now() + remainingTtl * 1000) : undefined;
            return {
                totalHits: parseInt(raw, 10) || 0,
                resetTime
            };
        } catch {
            return undefined;
        }
    }

    async increment(key) {
        const ttlSeconds = Math.max(Math.ceil(this.windowMs / 1000), 1);
        try {
            const count = await client.incr(key);
            if (count === 1) {
                await client.expire(key, ttlSeconds);
            }
            let remainingTtl = await client.ttl(key);
            if (remainingTtl < 0) {
                await client.expire(key, ttlSeconds);
                remainingTtl = ttlSeconds;
            }
            const resetTime = new Date(Date.now() + remainingTtl * 1000);
            return {
                totalHits: count,
                resetTime
            };
        } catch (err) {
            console.error("Redis Rate Limiter Error:", err.message);
            const resetTime = new Date(Date.now() + ttlSeconds * 1000);
            return {
                totalHits: 1,
                resetTime
            };
        }
    }

    async decrement(key) {
        try {
            if (await client.exists(key)) {
                await client.decr(key);
            }
        } catch (e) {
            // ignore decrement error
        }
    }

    async resetKey(key) {
        try {
            await client.del(key);
        } catch (e) {
            // ignore reset error
        }
    }
}

export const generateRateLimiter = ({
    ttl=5,
    limit=50,
    legacyHeaders=true,
    standardHeaders="draft-8", 
    message="Too Many Requests",
    statusCode=429,
    skipSuccessfulRequests,
    skipFailedRequests
}) =>{
    return rateLimit({
        windowMs: ttl * 60 * 1000,
        legacyHeaders,
        standardHeaders,
        skipSuccessfulRequests,
        skipFailedRequests,
        handler: function (req, res, next) {
            return res.status(statusCode).json({
                message,
                error_message: message,
                status: statusCode
            });
        },
        limit: limit,
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52);
            return `${ip}::${req.path}`;
        },
        store: new RedisRateLimitStore(ttl)
    });
}
