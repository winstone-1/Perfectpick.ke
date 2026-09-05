import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
        enum: [
            'bags',
            'shoes',
            'jewelry',
            'gifts',
            'accessories',
            'clothes',
            'handbags',
            'earrings',
            'hairclips',
            'keyrings',
            'phone-charms',
            'beauty-accessories',
            'gift-boxes',
            'mugs',
            'fans',
            'body-mists',
            'oils',
            'ponchos',
            'sweaters',
            'cardigans',
            'watches',
            'rings',
        ],
    },
    images: {
        type: [String],
        default: [],
    },
    videos: {
        type: [String], // Cloudinary video URLs
        default: [],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number, // percentage e.g. 20 = 20% off
        default: 0,
    },
    discountBanner: {
        type: String, // Cloudinary image URL for sale banner
        default: '',
    },
    discountLabel: {
        type: String, // e.g. "Weekend Sale", "Flash Deal"
        default: '',
    },
    variants: [
        {
            name: { type: String, required: true },
            stock: { type: Number, required: true, default: 0 },
        }
    ],
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;