const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().optional(),
    price: Joi.number().min(0).required(),
    category: Joi.string().trim().required(),
    sku: Joi.string().trim().required(),
    stock: Joi.number().min(0).optional()
});

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errMessages = error.details.map(err => err.message);
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation Error',
            errors: errMessages
        });
    }
    next();
};

const validateProductUpdate = (req, res, next) => {
    // Same rules but everything is optional since it's a PATCH/PUT
    const updateSchema = productSchema.fork(Object.keys(productSchema.describe().keys), (schema) => schema.optional());

    const { error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errMessages = error.details.map(err => err.message);
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation Error',
            errors: errMessages
        });
    }
    next();
}

module.exports = {
    validateProduct,
    validateProductUpdate
};
