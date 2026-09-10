import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Calendar, ShoppingBag, Mail, ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const NewArrivals = () => {
  const { t } = useTranslation();
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

    if (diffDays === 0) return t('newArrivals.justInToday');
    if (diffDays === 1) return t('newArrivals.addedYesterday');
    return t('newArrivals.addedDaysAgo', { days: diffDays });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-surface/50 dark:bg-stone-900/50 py-12 md:py-20 px-4 md:px-8 border-b border-border/40 dark:border-stone-800">
        <div className="container mx-auto text-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20"
          >
            <Sparkles size={14} /> {t('newArrivals.badge')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-black text-dark dark:text-stone-100"
          >
            {t('newArrivals.title')} <span className="text-primary dark:text-amber-300 italic" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-medium dark:text-stone-300 max-w-2xl mx-auto leading-relaxed px-4"
          >
            {t('newArrivals.desc')}
          </motion.p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container mx-auto py-8 md:py-12 px-4 md:px-8 space-y-8">
        {/* Time Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex bg-surface dark:bg-stone-800 p-1.5 rounded-full border border-stone-200/80 dark:border-stone-700 w-full md:w-auto overflow-x-auto no-scrollbar shadow-xs">
            <button
              onClick={() => setFilter('7days')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                filter === '7days'
                  ? "bg-primary text-white dark:bg-amber-400 dark:text-stone-950 shadow-md"
                  : "text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100"
              )}
            >
              {t('newArrivals.last7Days')}
            </button>
            <button
              onClick={() => setFilter('month')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                filter === 'month'
                  ? "bg-primary text-white dark:bg-amber-400 dark:text-stone-950 shadow-md"
                  : "text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100"
              )}
            >
              {t('newArrivals.thisMonth')}
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                filter === 'all'
                  ? "bg-primary text-white dark:bg-amber-400 dark:text-stone-950 shadow-md"
                  : "text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100"
              )}
            >
              {t('newArrivals.allRecent')}
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative group flex flex-col"
                >
                  <ProductCard product={product} />

                  {/* Added Date Text */}
                  <div className="mt-2 text-[11px] text-muted-foreground dark:text-stone-400 italic px-2">
                    {getAddedText(product.createdAt)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface dark:bg-stone-800 text-medium dark:text-stone-400">
              <ShoppingBag size={36} />
            </div>
            <h3 className="text-xl font-serif font-black text-dark dark:text-stone-100">{t('newArrivals.noArrivals')}</h3>
            <p className="text-muted-foreground dark:text-stone-400 max-w-xs mx-auto text-xs">
              {t('newArrivals.noArrivalsDesc')}
            </p>
            <Button
              variant="outline"
              onClick={() => setFilter('all')}
              className="mt-4 border-primary text-primary dark:text-amber-300 hover:bg-primary/10 rounded-2xl"
            >
              {t('newArrivals.seeAllBtn')}
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-stone-900 dark:bg-stone-950 text-white py-12 md:py-20 px-4 md:px-8 mt-12 border-t border-stone-800">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-100">Get Early Access</h2>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed">
                Join our exclusive VIP drop list to receive early previews of limited stock and seasonal collections in Nairobi.
              </p>
            </div>
            <div className="space-y-3">
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-500 pl-11 h-13 rounded-2xl focus:ring-primary focus:border-primary w-full text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="btn-primary h-13 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-md cursor-pointer"
                >
                  Notify Me <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
              <p className="text-[10px] text-stone-500 text-center md:text-left">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;
