import axios from 'axios';

const testRoutes = async () => {
    try {
        console.log('Testing GET /api/products...');
        const resAll = await axios.get('http://localhost:3000/api/products');
        console.log(`Success: Found ${resAll.data.data.length} products`);

        console.log('\nTesting GET /api/products?featured=true...');
        const resFeatured = await axios.get('http://localhost:3000/api/products?featured=true');
        console.log(`Success: Found ${resFeatured.data.data.length} featured products`);

        console.log('\nTesting GET /api/auth/config-check...');
        const resConfig = await axios.get('http://localhost:3000/api/auth/config-check');
        console.log('Success: Server config is healthy');

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
};

testRoutes();
