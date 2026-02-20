const { validateProduct } = require('../../src/middlewares/validate');

describe('Validation Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    it('should call next() if payload is valid', () => {
        mockReq = {
            body: {
                name: 'Phone',
                price: 500,
                category: 'Electronics',
                sku: 'ELEC-123'
            }
        };

        validateProduct(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', () => {
        mockReq = {
            body: {
                name: 'Phone' // missing price, category, sku
            }
        };

        validateProduct(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 'error',
            statusCode: 400,
            message: 'Validation Error'
        }));
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
