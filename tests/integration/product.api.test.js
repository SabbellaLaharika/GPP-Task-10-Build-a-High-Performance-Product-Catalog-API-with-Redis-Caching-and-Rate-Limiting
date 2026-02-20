const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../src/app');
const Product = require('../../src/models/product.model');
const redisClient = require('../../src/config/redis');

// Mock Redis client locally so we don't need a real redis for API structural tests
// (In a real scenario, we might use ioredis-mock or an actual test DB)

jest.mock('../../src/config/redis', () => ({
    connect: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(60),
}));

describe('Product API Integration Tests', () => {
    let createdProductId;

    beforeAll(async () => {
        // Only connect if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
        }
    });

    afterAll(async () => {
        await Product.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({
                    name: 'Test Product',
                    description: 'A product for testing',
                    price: 99.99,
                    category: 'Electronics',
                    sku: 'TEST-SKU-001',
                    stock: 50
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toEqual('Test Product');
            createdProductId = res.body._id;
        });

        it('should return 400 for invalid input', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({
                    name: '', // Invalid name
                    price: -10 // Invalid price
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('GET /api/products', () => {
        it('should return a list of products', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('products');
            expect(res.body).toHaveProperty('total');
            expect(Array.isArray(res.body.products)).toBeTruthy();
            expect(res.body.products.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return a single product', async () => {
            const res = await request(app).get(`/api/products/${createdProductId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toEqual(createdProductId);
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/products/${fakeId}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update a product', async () => {
            const res = await request(app)
                .put(`/api/products/${createdProductId}`)
                .send({ stock: 25 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.stock).toEqual(25);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product', async () => {
            const res = await request(app).delete(`/api/products/${createdProductId}`);
            expect(res.statusCode).toEqual(204);

            // Verify deletion
            const checkRes = await request(app).get(`/api/products/${createdProductId}`);
            expect(checkRes.statusCode).toEqual(404);
        });
    });
});
