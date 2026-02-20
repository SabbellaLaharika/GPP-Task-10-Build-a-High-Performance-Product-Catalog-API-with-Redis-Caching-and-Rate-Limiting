const rateLimiter = require('../../src/middlewares/rateLimiter');
const redisClient = require('../../src/config/redis');

// Mock Redis Client
jest.mock('../../src/config/redis', () => ({
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn()
}));

describe('Rate Limiter Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = { ip: '192.168.1.1', connection: {} };
        mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    it('should allow the first request and set expiration', async () => {
        redisClient.incr.mockResolvedValue(1);
        redisClient.expire.mockResolvedValue(1);

        await rateLimiter(mockReq, mockRes, nextFunction);

        expect(redisClient.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
        expect(redisClient.expire).toHaveBeenCalledWith('rate_limit:192.168.1.1', 60);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow subsequent requests within the limit', async () => {
        redisClient.incr.mockResolvedValue(50);

        await rateLimiter(mockReq, mockRes, nextFunction);

        expect(redisClient.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
        expect(redisClient.expire).not.toHaveBeenCalled(); // Only called on first request
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 50);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should block requests exceeding the limit and return 429', async () => {
        redisClient.incr.mockResolvedValue(101); // Over the 100 limit
        redisClient.ttl.mockResolvedValue(30);

        await rateLimiter(mockReq, mockRes, nextFunction);

        expect(redisClient.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
        expect(redisClient.ttl).toHaveBeenCalledWith('rate_limit:192.168.1.1');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', 30);
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Too Many Requests'
        }));
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail open (call next) if redis crashes to prevent API downtime', async () => {
        redisClient.incr.mockRejectedValue(new Error('Redis is down'));

        await rateLimiter(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
    });
});
