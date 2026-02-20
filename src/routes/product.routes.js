const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateProduct, validateProductUpdate } = require('../middlewares/validate');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply global rate limiting to all product routes
router.use(rateLimiter);

// CREATE Product - POST /api/products
router.post('/', validateProduct, productController.createProduct);

// GET Paginated list - GET /api/products
router.get('/', productController.getProducts);

// GET Single product - GET /api/products/:id
router.get('/:id', productController.getProductById);

// UPDATE Product - PUT /api/products/:id
router.put('/:id', validateProductUpdate, productController.updateProduct);

// DELETE Product - DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
