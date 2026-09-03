import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { category, search, sort, featured } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (featured === 'true') {
            query.featured = true;
        }

        let productsQuery = Product.find(query);

        if (sort === 'price_asc') {
            productsQuery = productsQuery.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            productsQuery = productsQuery.sort({ price: -1 });
        } else if (sort === 'newest') {
            productsQuery = productsQuery.sort({ createdAt: -1 });
        } else {
            productsQuery = productsQuery.sort({ createdAt: -1 });
        }

        const result = await productsQuery;
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(`Error in getProducts: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while fetching products' });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error(`Error in getProductById: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while fetching product detail' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
    try {
        let { name, description, price, category, stock, images, featured, variants } = req.body;

        // Parse JSON fields if they are strings
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch (e) { variants = []; }
        }
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch (e) { images = [images]; }
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            stock: stock || 0,
            images: images || [],
            featured: featured || false,
            variants: variants || [],
        });

        const createdProduct = await product.save();
        res.status(201).json({ success: true, data: createdProduct });
    } catch (error) {
        console.error(`Error in createProduct: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while creating product' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let { name, description, price, category, stock, images, featured, variants } = req.body;

        // Parse JSON fields if they are strings
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch (e) { variants = []; }
        }
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch (e) { images = [images]; }
        }

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.images = images ?? product.images;
        product.featured = featured ?? product.featured;
        product.variants = variants ?? product.variants;

        const updatedProduct = await product.save();
        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error(`Error in updateProduct: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while updating product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product removed' });
    } catch (error) {
        console.error(`Error in deleteProduct: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while deleting product' });
    }
};

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error(`Error in getFeaturedProducts: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while fetching featured products' });
    }
};

// @desc    Fetch all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error(`Error in getCategories: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error while fetching categories' });
    }
};