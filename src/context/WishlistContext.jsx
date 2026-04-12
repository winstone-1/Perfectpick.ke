import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id || user._id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      } else {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [user]);

  const saveToStorage = (items) => {
    if (user) {
      localStorage.setItem(`wishlist_${user.id || user._id}`, JSON.stringify(items));
    }
  };

  const addToWishlist = (product) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (wishlist.some(item => item._id === product._id)) {
      toast.info('Item already in wishlist');
      return;
    }
    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    saveToStorage(newWishlist);
    toast.success('Added to wishlist');
  };

  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item._id !== productId);
    setWishlist(newWishlist);
    saveToStorage(newWishlist);
    toast.success('Removed from wishlist');
  };

  const isWishlisted = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
