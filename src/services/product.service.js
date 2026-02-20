const Product = require('../models/product.model');
const cacheService = require('./cache.service');

class ProductService {
    async createProduct(productData) {
        const product = new Product(productData);
        const savedProduct = await product.save();

        // Invalidate paginated lists since a new item was added
        await cacheService.invalidatePattern('products:all:*');

        return savedProduct;
    }

    async getProducts(page = 1, limit = 10) {
        const cacheKey = `products:all:page:${page}:limit:${limit}`;

        // Check Cache
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Cache Miss. Query DB
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find().skip(skip).limit(limit).lean(),
            Product.countDocuments()
        ]);

        const result = {
            products,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // Store in cache for 60 seconds (TTL)
        await cacheService.set(cacheKey, result, 60);

        return result;
    }

    async getProductById(id) {
        const cacheKey = `products:id:${id}`;

        // Check Cache
        const cachedProduct = await cacheService.get(cacheKey);
        if (cachedProduct) {
            return cachedProduct;
        }

        // Cache Miss. Query DB
        const product = await Product.findById(id).lean();
        if (!product) return null;

        // Cache the single product for 60s
        await cacheService.set(cacheKey, product, 60);

        return product;
    }

    async updateProduct(id, updateData) {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // Return modified document
        ).lean();

        if (!updatedProduct) return null;

        // Invalidate caches
        await cacheService.del(`products:id:${id}`); // specific item
        await cacheService.invalidatePattern('products:all:*'); // paginated lists

        return updatedProduct;
    }

    async deleteProduct(id) {
        const result = await Product.findByIdAndDelete(id);
        if (!result) return false;

        // Invalidate caches
        await cacheService.del(`products:id:${id}`); // specific item
        await cacheService.invalidatePattern('products:all:*'); // paginated lists

        return true;
    }
}

module.exports = new ProductService();
