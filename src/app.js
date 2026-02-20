const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load swagger file
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yml'));
// Routes imports
const productRoutes = require('./routes/product.routes');

// Middleware imports
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Basic logging

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/products', productRoutes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
