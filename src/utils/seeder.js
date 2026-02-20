const Product = require('../models/product.model');

const seedDatabase = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('📦 Database is empty. Seeding products...');
            const products = [];
            for (let i = 1; i <= 10; i++) {
                products.push({
                    name: `Sample Product ${i}`,
                    description: `This is the description for sample product ${i}. It is a high-quality item.`,
                    price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
                    category: `Category ${i % 3 + 1}`,
                    sku: `SKU-${Date.now()}-${i}`,
                    stock: Math.floor(Math.random() * 100)
                });
            }
            await Product.insertMany(products);
            console.log('✅ 10 Sample products seeded successfully.');
        } else {
            console.log(`📦 Database already contains ${count} products.`);
        }
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
};

module.exports = seedDatabase;
