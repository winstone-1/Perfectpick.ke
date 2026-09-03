import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-surface rounded-full flex items-center justify-center text-red-500"
        >
          <Heart size={64} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark">Your wishlist is empty</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Save your favorite luxury picks here to keep track of what you love.
          </p>
        </div>
        <Link to="/products">
          <Button className="btn-primary h-12 px-10 rounded-full">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-black text-dark">My Wishlist</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Heart size={18} className="text-red-500 fill-red-500" />
          <span>{wishlist.length} FAVORITES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence>
          {wishlist.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
