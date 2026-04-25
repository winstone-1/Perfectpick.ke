import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import NewArrivals from './pages/NewArrivals';
import TrendingNow from './pages/TrendingNow';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ShippingPolicy from './pages/ShippingPolicy';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Toaster position="top-center" expand={true} richColors />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="home" element={<Home />} /> 
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="new-arrivals" element={<NewArrivals />} />
                <Route path="trending" element={<TrendingNow />} />
                <Route path="about" element={<About />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="shipping" element={<ShippingPolicy />} />
                <Route path="refund" element={<RefundPolicy />} />
                
                {/* Protected Routes */}
                <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/products" element={<ProtectedRoute adminOnly={true}><ManageProducts /></ProtectedRoute>} />
                <Route path="admin/orders" element={<ProtectedRoute adminOnly={true}><ManageOrders /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
