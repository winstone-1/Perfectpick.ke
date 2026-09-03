import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'perfect-pick/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
    },
});

// Avatar images
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'perfect-pick/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
});

// Product videos
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'perfect-pick/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'webm'],
    },
});

// Banner images
const bannerStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'perfect-pick/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto' }],
    },
});

const upload = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadSingle = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');

export const uploadVideos = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}).array('videos', 3);

export const uploadBanner = multer({
    storage: bannerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('discountBanner');

export const uploadToCloudinary = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        if (req.body.images && typeof req.body.images === 'string') {
            try {
                req.body.images = JSON.parse(req.body.images);
            } catch {
                req.body.images = [req.body.images];
            }
        }
        return next();
    }

    try {
        const newImageUrls = req.files.map(file => file.path);

        let existingImages = [];
        if (req.body.images) {
            try {
                existingImages = JSON.parse(req.body.images);
                if (!Array.isArray(existingImages)) existingImages = [existingImages];
            } catch {
                existingImages = [req.body.images];
            }
        }

        req.body.images = [...existingImages, ...newImageUrls];
        next();
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        next(error);
    }
};

export default upload;