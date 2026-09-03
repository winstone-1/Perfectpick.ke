import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/products/${product._id}`} className="block relative">
        {/* Image Container */}
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface relative flex items-center justify-center">
          { (product.images?.[0] || product.image) ? (
            <motion.img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-40">
              <ShoppingBag size={48} className="text-medium" />
              <span className="text-sm font-medium italic">Perfect Pick</span>
            </div>
          )}

          {/* Wishlist Toggle Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full shadow-lg border-none",
                wishlisted ? "bg-white text-red-500" : "bg-white/80 text-medium hover:text-red-500"
              )}
              onClick={handleWishlist}
            >
              <Heart size={18} className={wishlisted ? "fill-red-500" : ""} />
            </Button>
          </div>

          {/* New/Featured Badge */}
          {(product.featured || product.isFeatured) && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-white border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-1 px-1">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#c08050] font-bold">
              {product.category}
            </span>
            {product.variants?.length > 1 && (
              <span className="text-[10px] text-muted-foreground italic">
                {product.variants.length} options
              </span>
            )}
          </div>
          <h3 className="text-base font-serif font-semibold text-dark line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-medium">
            {formattedPrice}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
