require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const redisClient = require('./config/redis');
const seedDatabase = require('./utils/seeder');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 1. Connect to MongoDB
        await connectDB();

        // 2. Connect to Redis (the client usually auto-connects in node-redis v4 but we explicitly connect)
        await redisClient.connect().catch(console.error);
        console.log('✅ Connected to Redis successfully');

        // 3. Seed Database
        await seedDatabase();

        // 4. Start Server
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
