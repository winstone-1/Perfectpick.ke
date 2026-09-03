import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoURI) {
        console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
        return; 
    }

    try {
        const options = {
            connectTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, 
        };
        const conn = await mongoose.connect(mongoURI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        // Do not use process.exit(1) on Vercel
    }
};

export default connectDB;
