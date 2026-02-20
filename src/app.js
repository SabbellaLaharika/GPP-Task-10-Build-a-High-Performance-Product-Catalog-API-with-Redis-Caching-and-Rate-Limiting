const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

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

// API Routes
app.use('/api/products', productRoutes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
