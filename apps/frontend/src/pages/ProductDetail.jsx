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
  RotateCcw,
  Loader2
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

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
  const [mainImage, setMainImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      const productData = data.data;
      setProduct(productData);
      setMainImage(productData.images?.[0] || productData.image || null);

      if (productData.variants?.length > 0) {
        const firstInStock = productData.variants.find(v => v.stock > 0);
        setSelectedVariant(firstInStock || productData.variants[0]);
      }

      const relatedRsp = await api.get(`/products?category=${productData.category}&limit=5`);
      setRelatedProducts(
        (relatedRsp.data.data || []).filter(p => p._id !== id).slice(0, 4)
      );
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product details');
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
    if (!user) {
      toast.error('Please login to add to wishlist');
      return navigate('/login');
    }
    if (wishlisted) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return navigate('/login');
    }
    
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    
    if (selectedVariant.stock === 0) {
      toast.error('This variant is out of stock');
      return;
    }
    
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} items available`);
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart(product._id, selectedVariant.name, quantity);
      // Success toast is handled in CartContext
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-xl" />
            <Skeleton className="h-12 w-2/3 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-1/2 rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16 rounded-xl" />
                <Skeleton className="h-10 w-16 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">Product not found</h1>
        <Link to="/products">
          <Button className="btn-primary">Back to products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(product.price);

  const whatsappMessage = encodeURIComponent(
    `Hi PerfectPick Nairobi! I am inquiring about:\n- Item: ${product.name}\n- Price: ${formattedPrice}\n- Category: ${product.category || 'Luxury'}${selectedVariant ? `\n- Option: ${selectedVariant.name}` : ''}\n- Link: ${window.location.href}`
  );
  const whatsappUrl = `https://wa.me/254787251690?text=${whatsappMessage}`;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-20">
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-sm font-bold text-medium dark:text-stone-300 hover:text-primary dark:hover:text-primary transition-colors group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div className="aspect-square bg-surface dark:bg-stone-900 rounded-3xl overflow-hidden flex items-center justify-center relative shadow-[0_8px_30px_rgba(61,39,26,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-stone-200/70 dark:border-stone-800">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <ShoppingBag size={100} className="text-medium dark:text-stone-400 opacity-20" />
            )}
            
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute top-5 right-5 h-11 w-11 rounded-full shadow-lg border-none transition-transform hover:scale-105 cursor-pointer",
                wishlisted 
                  ? "bg-white dark:bg-stone-800 text-red-500" 
                  : "bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:text-red-500"
              )}
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={22} className={wishlisted ? "fill-red-500" : ""} />
            </Button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={cn(
                    "h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer",
                    mainImage === img 
                      ? "border-primary scale-105 shadow-md" 
                      : "border-transparent opacity-70 hover:opacity-100 dark:bg-stone-900"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <Badge className="bg-primary/15 text-primary dark:text-amber-300 border-none uppercase tracking-widest font-black px-3.5 py-1 rounded-full text-[10px]">
              {product.category || 'Luxury Pick'}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black text-dark dark:text-stone-100 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-primary dark:text-amber-300">{formattedPrice}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground dark:text-stone-400">Description</h3>
            <p className="text-medium dark:text-stone-300 leading-relaxed text-sm md:text-base">{product.description || 'Curated luxury fashion item from Nairobi.'}</p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground dark:text-stone-400">
                Option: <span className="text-dark dark:text-stone-100 font-bold ml-1">{selectedVariant?.name || 'None'}</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => (
                  <button
                    key={variant.name}
                    disabled={variant.stock === 0}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer",
                      selectedVariant?.name === variant.name 
                        ? "bg-dark dark:bg-primary text-white border-dark dark:border-primary shadow-sm scale-102" 
                        : "bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-medium dark:text-stone-200 hover:border-primary hover:text-primary",
                      variant.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className={cn(
                  "text-xs font-bold",
                  selectedVariant.stock < 5 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {selectedVariant.stock > 0 
                    ? `In Stock (${selectedVariant.stock} available)` 
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start border border-stone-200/80 dark:border-stone-700 rounded-xl p-1 bg-white dark:bg-stone-900">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-medium dark:text-stone-300"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => q - 1)}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center font-bold text-lg text-dark dark:text-stone-100">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-medium dark:text-stone-300"
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <Button 
                className="flex-1 btn-primary h-13 text-base rounded-xl font-black shadow-md"
                disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? (
                  <Loader2 className="mr-2 animate-spin" size={20} />
                ) : (
                  <ShoppingBag className="mr-2" size={20} />
                )}
                {addingToCart ? 'Adding to Bag...' : 'Add to Cart'}
              </Button>
            </div>

            {/* WhatsApp Direct Inquire / Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-98"
            >
              <FaWhatsapp size={18} />
              <span>Inquire / Order on WhatsApp</span>
            </a>

            {/* Trust Pillars */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/20 dark:border-stone-800 pt-6 mt-4">
              <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-surface/50 dark:bg-stone-900/60 border border-stone-200/40 dark:border-stone-800">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Truck size={18} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tight text-dark dark:text-stone-200">Fast Nairobi Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-surface/50 dark:bg-stone-900/60 border border-stone-200/40 dark:border-stone-800">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><ShieldCheck size={18} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tight text-dark dark:text-stone-200">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-surface/50 dark:bg-stone-900/60 border border-stone-200/40 dark:border-stone-800">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><RotateCcw size={18} /></div>
                <span className="text-[10px] uppercase font-bold tracking-tight text-dark dark:text-stone-200">7-Day Return</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-8 border-t border-border/30 dark:border-stone-800">
          <div className="text-center space-y-1.5">
            <h2 className="text-3xl font-serif font-black text-dark dark:text-stone-100">You Might Also Love</h2>
            <p className="text-sm text-muted-foreground dark:text-stone-400">Curated pieces to complete your style</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;