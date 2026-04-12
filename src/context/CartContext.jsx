import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't toast on fetch error to avoid noise on page load
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variant, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      const { data } = await api.post('/cart', { productId, variant, quantity });
      setCart(data.items);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.items);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.items);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.productId.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
