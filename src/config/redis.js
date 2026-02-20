const { createClient } = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;
const client = createClient({
    url: redisUrl
});

client.on('error', (err) => {
    console.error('❌ Redis Client Error', err);
});

module.exports = client;
