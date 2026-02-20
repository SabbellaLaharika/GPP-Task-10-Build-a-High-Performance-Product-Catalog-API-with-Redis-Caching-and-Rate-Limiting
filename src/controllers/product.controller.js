const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        return res.status(201).json(product);
    } catch (error) {
        // Check for MongoDB Duplicate Key Error (e.g. SKU must be unique)
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Duplicate key error. SKU must be unique.',
                details: error.keyValue
            });
        }
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Bounds checking
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Page and limit must be positive integers.'
            });
        }

        const result = await productService.getProducts(page, limit);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Let service handle it, though basic mongoose Object ID validation could go here
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ status: 'error', statusCode: 400, message: 'Invalid Product ID format' });
        }

        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ status: 'error', statusCode: 404, message: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ status: 'error', statusCode: 400, message: 'Invalid Product ID format' });
        }

        const updatedProduct = await productService.updateProduct(id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', statusCode: 404, message: 'Product not found' });
        }

        return res.status(200).json(updatedProduct);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Duplicate key error. SKU must be unique.',
                details: error.keyValue
            });
        }
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ status: 'error', statusCode: 400, message: 'Invalid Product ID format' });
        }

        const isDeleted = await productService.deleteProduct(id);
        if (!isDeleted) {
            return res.status(404).json({ status: 'error', statusCode: 404, message: 'Product not found' });
        }

        return res.status(204).send(); // 204 No Content
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
