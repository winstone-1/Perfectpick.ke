import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ChevronLeft, 
  Minus, 
  Plus, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      if (data.product.variants?.length > 0) {
        // Find first variant that is in stock, otherwise first variant
        const firstInStock = data.product.variants.find(v => v.stock > 0);
        setSelectedVariant(firstInStock || data.product.variants[0]);
      }
      
      // Fetch related products
      const relatedRsp = await api.get(`/products?category=${data.product.category}&limit=5`);
      setRelatedProducts(relatedRsp.data.products.filter(p => p._id !== id).slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch product:', error);
      // Maybe navigate to 404
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  const wishlisted = product ? isWishlisted(product._id) : false;

  const handleWishlist = () => {
    if (!user) return navigate('/login');
    if (wishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    if (!selectedVariant) return;
    addToCart(product._id, selectedVariant.name, quantity);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-20">
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-surface rounded-3xl overflow-hidden flex items-center justify-center relative">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag size={120} className="text-medium opacity-20" />
            )}
            
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute top-6 right-6 h-12 w-12 rounded-full shadow-lg border-none",
                wishlisted ? "bg-white text-red-500" : "bg-white/80 text-medium hover:text-red-500"
              )}
              onClick={handleWishlist}
            >
              <Heart size={24} className={wishlisted ? "fill-red-500" : ""} />
            </Button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest font-bold px-3 py-1">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-dark">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</h3>
            <p className="text-medium leading-relaxed">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Select Option: <span className="text-dark ml-2">{selectedVariant?.name}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.name}
                    disabled={variant.stock === 0}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      "px-6 py-3 rounded-xl border text-sm font-bold transition-all duration-300",
                      selectedVariant?.name === variant.name 
                        ? "bg-dark text-white border-dark shadow-md" 
                        : "bg-white border-border/20 text-medium hover:border-primary hover:text-primary",
                      variant.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className={cn(
                  "text-xs font-medium",
                  selectedVariant.stock < 5 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {selectedVariant.stock > 0 
                    ? `Only ${selectedVariant.stock} left in stock - order soon` 
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="pt-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-border/20 rounded-xl p-1 bg-white">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-medium"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => q - 1)}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-medium"
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <Button 
                className="flex-1 btn-primary h-14 text-lg rounded-xl"
                disabled={!selectedVariant || selectedVariant.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2" size={20} />
                Add to Cart
              </Button>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/10 pt-8">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-surface rounded-full text-primary"><Truck size={20} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tighter">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-surface rounded-full text-primary"><ShieldCheck size={20} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tighter">Verified Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-surface rounded-full text-primary"><RotateCcw size={20} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tighter">Easy Exchange</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold">You might also like</h2>
          <p className="text-muted-foreground">Complete your look with these picks</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
