const redisClient = require('../config/redis');

const DEFAULT_EXPIRATION = 60; // 60 seconds

class CacheService {
    /**
     * Get cached data by key
     * @param {string} key 
     * @returns {Object|null}
     */
    async get(key) {
        try {
            const data = await redisClient.get(key);
            if (data != null) {
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null; // Don't crash the app if cache fails
        }
    }

    /**
     * Set data in cache
     * @param {string} key 
     * @param {Object} data 
     * @param {number} expiration in seconds
     */
    async set(key, data, expiration = DEFAULT_EXPIRATION) {
        try {
            await redisClient.setEx(key, expiration, JSON.stringify(data));
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }

    /**
     * Delete data from cache (invalidate)
     * @param {string} key 
     */
    async del(key) {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error(`Cache del error for key ${key}:`, error);
        }
    }

    /**
     * Invalidate multiple keys based on a pattern
     * This is useful for invalidating all paginated list caches when a product is modified
     * @param {string} pattern 
     */
    async invalidatePattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys); // del accepts an array of keys in modern node-redis
            }
        } catch (error) {
            console.error(`Cache invalidatePattern error for pattern ${pattern}:`, error);
        }
    }
}

module.exports = new CacheService();
