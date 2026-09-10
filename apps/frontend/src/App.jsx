import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import Layout from './components/Layout';

import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Code-splitting: every page is lazy-loaded so the initial bundle only ships
// the app shell (navbar, layout, providers). Vite emits one chunk per page.
const Home = lazy(() => import('./pages/Home'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const NewArrivals = lazy(() => import('./pages/NewArrivals'));
const TrendingNow = lazy(() => import('./pages/TrendingNow'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <Toaster position="top-center" expand={true} richColors />
              <Routes>
                {/* Suspense: fallback while a lazy page chunk loads */}
                <Suspense fallback={
                  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                    <span className="sr-only">Loading…</span>
                  </div>
                }>
                {/* ErrorBoundary catches render crashes so one broken page
                    doesn't blank the whole app */}
                <Route path="/" element={<ErrorBoundary label="the app"><Layout /></ErrorBoundary>}>
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
                </Suspense>
              </Routes>

            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>

  );
}

export default App;
