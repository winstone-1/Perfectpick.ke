import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Calendar, ShoppingBag, Mail, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('7days'); // '7days', 'month', 'all'
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?sort=-createdAt&limit=30');
        // Expected response format: { data: { data: [...] } }
        setProducts(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const getFilteredProducts = () => {
    const now = new Date();
    return products.filter(product => {
      const createdDate = new Date(product.createdAt);
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filter === '7days') return diffDays <= 7;
      if (filter === 'month') return diffDays <= 30;
      return true;
    });
  };

  const filteredProducts = getFilteredProducts();

  const getAddedText = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Just In";
    if (diffDays === 1) return "Added yesterday";
    return `Added ${diffDays} days ago`;
  };

  const isNew = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const isJustIn = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    return now.toDateString() === createdDate.toDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-surface py-12 md:py-20 px-4 md:px-8 border-b border-border/10">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
          >
            <Sparkles size={14} /> Seasonal Drop
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-black text-[#1a1a1a]"
          >
            New <span className="text-primary italic">Arrivals</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-medium max-w-2xl mx-auto leading-relaxed px-4"
          >
            Be the first to wear the latest trends. Curated luxury pieces 
            straight from our newest collections to your wardrobe.
          </motion.p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container mx-auto py-8 md:py-12 px-4 md:px-8 space-y-8">
        {/* Time Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex bg-surface p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('7days')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === '7days' ? "bg-primary text-white shadow-lg" : "text-medium hover:bg-white/50"
              )}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setFilter('month')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === 'month' ? "bg-primary text-white shadow-lg" : "text-medium hover:bg-white/50"
              )}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === 'all' ? "bg-primary text-white shadow-lg" : "text-medium hover:bg-white/50"
              )}
            >
              All New
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <ProductCard product={product} />
                  
                  {/* Custom Badges for New Arrivals */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
                    {isJustIn(product.createdAt) ? (
                      <Badge className="bg-red-500 text-white border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                        Just In
                      </Badge>
                    ) : isNew(product.createdAt) ? (
                      <Badge className="bg-primary text-white border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                        New
                      </Badge>
                    ) : null}
                  </div>

                  {/* Added Date Text */}
                  <div className="mt-2 text-[11px] text-muted-foreground italic px-1">
                    {getAddedText(product.createdAt)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface text-medium">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-serif font-bold text-dark">No new arrivals found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Check back later or try selecting a wider time range.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilter('all')}
              className="mt-4 border-primary text-primary hover:bg-primary/10"
            >
              See All Arrivals
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-dark text-white py-12 md:py-20 px-4 md:px-8 mt-12">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Get First Dibs</h2>
              <p className="text-white/70 text-base md:text-lg">
                Join our elite list to receive exclusive early access to our newest drops and seasonal arrivals.
              </p>
            </div>
            <div className="space-y-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white pl-12 h-14 rounded-2xl focus:ring-primary focus:border-primary w-full"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-bold h-14 px-8 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group w-full sm:w-auto"
                >
                  Notify Me <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
              <p className="text-[10px] text-white/40 text-center md:text-left">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;
