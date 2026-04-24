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
      // Ensure data.items is always an array
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]); // Reset to empty array on error
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
  
  // Debug logging - check what's being sent
  console.log('Sending to cart API:', { productId, variant, quantity });
  
  try {
    const { data } = await api.post('/cart', { productId, variant, quantity });
    console.log('Cart API response:', data);
    setCart(Array.isArray(data.items) ? data.items : []);
    toast.success('Added to cart');
  } catch (error) {
    console.error('Add to cart error details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    toast.error(error.response?.data?.message || 'Failed to add to cart');
  }
};

  const removeFromCart = async (itemId) => {
    if (!itemId) {
      toast.error('Invalid item');
      return;
    }
    
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(Array.isArray(data.items) ? data.items : []);
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!itemId) return;
    if (quantity < 1) return;
    
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Safe calculations with array validation
  const cartCount = Array.isArray(cart) 
    ? cart.reduce((total, item) => total + (item?.quantity || 0), 0)
    : 0;
    
  const cartTotal = Array.isArray(cart)
    ? cart.reduce((total, item) => {
        const price = item?.productId?.price || 0;
        const quantity = item?.quantity || 0;
        return total + (price * quantity);
      }, 0)
    : 0;

  return (
    <CartContext.Provider 
      value={{ 
        cart: Array.isArray(cart) ? cart : [], 
        loading, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartCount, 
        cartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};