// Production: seed data neutralized.
// Previous seed contained 10 mock products with Unsplash placeholder images and arbitrary stock values.
// Live DB currently holds 7 products (all derived from this seed, 100% of catalog). Deleting them would wipe the store.
// Real catalog must be created via POST /api/products (admin) with Cloudinary images.
// This file is intentionally empty to prevent accidental re-seeding in production.
// To seed dev only, restore from git history on a non-production DB.
const products = [];

export default products;
