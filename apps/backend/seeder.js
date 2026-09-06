import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './src/data/products.js';
import Product from './src/models/Product.js';
import connectDB from './src/config/db.js';

dotenv.config();

connectDB();

// PRODUCTION SAFEGUARD: seeder is disabled by default.
// Seed data (Unsplash placeholders, stock:10) was for dev only.
// Running this in production would wipe the live catalog (7/7 products are seed-derived, 100% would be deleted).
// To run intentionally: SEED_ENABLED=true node seeder.js [--force in production]
const isProduction = process.env.NODE_ENV === 'production';
const seedEnabled = process.env.SEED_ENABLED === 'true';
const forceFlag = process.argv.includes('--force');

if (isProduction && !seedEnabled) {
    console.error('[SEEDER] BLOCKED: seeder disabled in production. Set SEED_ENABLED=true and --force to run.');
    process.exit(1);
}
if (isProduction && !forceFlag) {
    console.error('[SEEDER] BLOCKED: --force required in production to confirm destructive operation.');
    process.exit(1);
}
if (!products || products.length === 0) {
    console.error('[SEEDER] No seed products defined (products.js is intentionally empty in production).');
    process.exit(1);
}

const importData = async () => {
    try {
        console.warn('[SEEDER] WARNING: Product.deleteMany() will wipe live catalog — ensure this is intentional.');
        await Product.deleteMany();

        await Product.insertMany(products);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        console.warn('[SEEDER] WARNING: destroy will delete all products.');
        await Product.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
