import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const ProductCard = ({ product }) => {
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (wishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(product.price);

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group h-full"
    >
      <Link
        to={`/products/${product._id}`}
        className="flex flex-col h-full bg-card dark:bg-stone-900/90 rounded-2xl md:rounded-3xl p-3 border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(61,39,26,0.08)] dark:hover:border-primary/40 transition-all duration-300"
      >
        {/* Image Container */}
        <div className="aspect-square w-full overflow-hidden rounded-xl md:rounded-2xl bg-surface dark:bg-stone-800/80 relative flex items-center justify-center">
          {(product.images?.[0] || product.image) ? (
            <motion.img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30 dark:opacity-40 text-medium dark:text-stone-300">
              <ShoppingBag size={40} />
              <span className="text-xs font-serif font-bold italic">Perfect Pick</span>
            </div>
          )}

          {/* Wishlist Toggle Button */}
          <div className="absolute top-2.5 right-2.5">
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-md transition-all duration-200 cursor-pointer",
                wishlisted
                  ? "bg-white dark:bg-stone-800 text-red-500"
                  : "bg-white/90 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 hover:text-red-500 hover:bg-white dark:hover:bg-stone-800 opacity-90 group-hover:opacity-100"
              )}
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={16} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {(product.featured || product.isFeatured) && (
              <Badge className="bg-primary text-white border-none px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold shadow-sm rounded-full">
                Featured
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge className="bg-red-500 text-white border-none px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold shadow-sm rounded-full">
                -{product.discount}%
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3.5 space-y-1.5 px-1 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                {product.category || 'Luxury Pick'}
              </span>
              {product.variants?.length > 1 && (
                <span className="text-[10px] text-muted-foreground dark:text-stone-400 font-medium">
                  {product.variants.length} options
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-dark dark:text-stone-100 line-clamp-1 group-hover:text-primary transition-colors mt-0.5">
              {product.name}
            </h3>
          </div>

          <div className="pt-1 flex items-baseline gap-2">
            {discountedPrice ? (
              <>
                <p className="text-sm sm:text-base font-black text-primary dark:text-amber-300">
                  {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(discountedPrice)}
                </p>
                <span className="text-xs text-muted-foreground dark:text-stone-400 line-through">
                  {formattedPrice}
                </span>
              </>
            ) : (
              <p className="text-sm sm:text-base font-black text-dark dark:text-stone-100">
                {formattedPrice}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

