const redisClient = require('../config/redis');

// Rate limit settings
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUESTS = 100;

const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const redisKey = `rate_limit:${ip}`;

        // Increment the number of requests for this IP
        const requests = await redisClient.incr(redisKey);

        if (requests === 1) {
            // If it's the first request, set the expiration window
            await redisClient.expire(redisKey, WINDOW_SIZE_IN_SECONDS);
            res.setHeader('X-RateLimit-Limit', MAX_WINDOW_REQUESTS);
            res.setHeader('X-RateLimit-Remaining', MAX_WINDOW_REQUESTS - 1);
            return next();
        }

        // Checking if they've exceeded the limit
        if (requests > MAX_WINDOW_REQUESTS) {
            const ttl = await redisClient.ttl(redisKey);
            res.setHeader('Retry-After', ttl);
            return res.status(429).json({
                status: 'error',
                statusCode: 429,
                message: 'Too Many Requests',
                retryAfter: ttl
            });
        }

        // Set headers for allowed requests
        res.setHeader('X-RateLimit-Limit', MAX_WINDOW_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', MAX_WINDOW_REQUESTS - requests);
        next();
    } catch (error) {
        console.error('Redis Rate Limiter Error:', error);
        // If Redis fails, allow the request to pass to avoid breaking the API
        next();
    }
};

module.exports = rateLimiter;
