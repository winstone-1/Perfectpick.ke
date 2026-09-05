import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-28 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-surface dark:bg-stone-800 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 shadow-inner"
        >
          <Heart size={52} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">Your wishlist is empty</h1>
          <p className="text-muted-foreground dark:text-stone-400 text-sm max-w-sm mx-auto">
            Save your favorite luxury picks here to curate your personal collection and keep track of pieces you love.
          </p>
        </div>
        <Link to="/products">
          <Button className="btn-primary h-12 px-8 rounded-full shadow-md">
            Explore Collection
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/40 dark:border-stone-800 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">My Wishlist</h1>
          <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest mt-1">
            Curated picks saved for later
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs font-bold text-dark dark:text-stone-200 w-fit">
          <Heart size={14} className="text-red-500 fill-red-500" />
          <span>{wishlist.length} {wishlist.length === 1 ? 'FAVORITE' : 'FAVORITES'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <AnimatePresence>
          {wishlist.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
