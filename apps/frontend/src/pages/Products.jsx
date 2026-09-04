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

// Categories will be fetched from API

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
      if (activeCategory !== 'All') params.append('category', activeCategory.toLowerCase());
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
        if (data.success) {
          // Capitalize categories for display
          const formatted = data.data.map(c => c.charAt(0).toUpperCase() + c.slice(1));
          setCategories(['All', ...formatted]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // GSAP polish — subtle stagger for pricing grid, respects reduced motion
  useLayoutEffect(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.1,
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
    <div className="container mx-auto px-4 py-16 lg:py-20 space-y-10 bg-gradient-to-b from-bg to-surface/10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-5 max-w-xl w-full">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight">Our Collection</h1>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">Handpicked pricing — transparent, fair, luxury within reach</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search for bags, shoes, jewelry..."
              className="pl-10 h-12 bg-surface dark:bg-card rounded-xl border-border/20 shadow-sm focus:ring-primary font-medium text-lg placeholder:font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal size={18} />
            <span>Sort By:</span>
          </div>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] bg-surface dark:bg-card rounded-xl h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills — pricing filter */}
      <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-3 scrollbar-hide">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "rounded-full px-7 py-2.5 text-sm font-bold tracking-wide transition-all duration-300",
              activeCategory === cat 
                ? "bg-primary text-white border-none shadow-[0_4px_12px_rgba(192,128,80,0.25)] scale-[1.02]" 
                : "bg-white dark:bg-card border-border/10 text-medium hover:border-primary/30 hover:text-primary hover:bg-surface/50"

            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Product Grid — pricing */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
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
              className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-50"
            >
              <PackageOpen size={64} className="text-medium" />
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold">No Products Found</h3>
                <p>We couldn't find any items matching your criteria.</p>
              </div>
              <Button 
                variant="outline" 
                className="btn-outline mt-4"
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
