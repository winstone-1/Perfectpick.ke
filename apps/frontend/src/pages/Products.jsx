import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { cn } from '../lib/utils';

const FALLBACK_CATEGORIES = ['All', 'Bags', 'Shoes', 'Jewelry', 'Gifts', 'Accessories', 'Clothes'];

const formatCategoryLabel = (value) => {
  if (value === 'All') return 'All';
  return value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const gridRef = useRef(null);

  const activeCategory = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || 'newest';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (sort) params.append('sort', sort);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm, sort]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(['All', ...data.data]);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // GSAP polish — subtle stagger for product grid, respects reduced motion
  useLayoutEffect(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.05,
      });
    }, gridRef);
    return () => ctx.revert();
  }, [loading, products]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-border/40 dark:border-stone-800">
        <div className="space-y-4 max-w-xl w-full">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-black text-primary">Curated Nairobi Catalog</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-dark dark:text-stone-100 tracking-tight mt-1">
              Our Collection
            </h1>
          </div>
          <p className="text-sm text-medium dark:text-stone-300 font-medium leading-relaxed">
            Handpicked bags, shoes, jewelry, and luxury gifts. Explore timeless pieces curated for modern elegance.
          </p>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={18} />
            <Input 
              placeholder="Search bags, shoes, jewelry, gifts..."
              className="pl-11 h-12 bg-card dark:bg-stone-900 rounded-2xl border-stone-200/80 dark:border-stone-700 shadow-sm focus:ring-primary font-medium text-sm text-dark dark:text-stone-100 placeholder:text-muted-foreground dark:placeholder:text-stone-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">
            <SlidersHorizontal size={16} />
            <span>Sort:</span>
          </div>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] bg-card dark:bg-stone-900 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100 rounded-xl h-11 text-xs font-bold">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-dark dark:text-stone-100 rounded-xl shadow-xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills — dynamic from backend */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer",
                isSelected 
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(192,128,80,0.35)] scale-102" 
                  : "bg-card dark:bg-stone-900 text-dark dark:text-stone-200 border border-stone-200/80 dark:border-stone-800 hover:border-primary/50 hover:bg-surface dark:hover:bg-stone-800"
              )}
            >
              {formatCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-4 p-3 bg-card dark:bg-stone-900 rounded-3xl border border-stone-200/40 dark:border-stone-800">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-lg" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="product-card">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-28 flex flex-col items-center justify-center text-center space-y-4 text-medium dark:text-stone-400"
            >
              <div className="w-20 h-20 rounded-full bg-surface dark:bg-stone-800 flex items-center justify-center text-primary">
                <PackageOpen size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-black text-dark dark:text-stone-100">No Products Found</h3>
                <p className="text-sm max-w-sm mx-auto">We couldn't find any items matching your filter criteria.</p>
              </div>
              <Button 
                variant="outline" 
                className="btn-outline mt-2"
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Products;

