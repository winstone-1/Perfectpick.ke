import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Eye, Heart, TrendingUp, ShoppingBag, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const TrendingNow = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('viewCount'); // 'viewCount', 'wishlistCount', 'salesCount'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Hero videos targeted at this page by admins (heroPages includes 'trending').
  const [heroVideos, setHeroVideos] = useState([]);
  const [heroPaused, setHeroPaused] = useState(false);
  // 24-hour rotation seed — computed once on mount (effect, not render,
  // so the purity lint rule stays happy and the index is stable).
  const [heroSeed, setHeroSeed] = useState(0);
  useEffect(() => {
    setHeroSeed(Math.floor(Date.now() / 86400000));
  }, []);

  const tabs = [
    { id: 'viewCount', label: t('trendingNow.mostViewed'), icon: <Eye size={16} /> },
    { id: 'wishlistCount', label: t('trendingNow.mostWished'), icon: <Heart size={16} /> },
    { id: 'salesCount', label: t('trendingNow.bestSelling'), icon: <TrendingUp size={16} /> },
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products?sort=-${activeTab}&limit=12`);
        // Expected response format: { data: { data: [...] } }
        setProducts(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [activeTab]);

  // Load admin-targeted hero videos for the Trending page (24h rotation seed).
  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        const items = data.data || [];
        const targeted = items.flatMap(p => {
          const pages = p.heroPages;
          return pages && pages.includes('trending') ? (p.videos || []) : [];
        });
        setHeroVideos(targeted);
      } catch {
        setHeroVideos([]);
      }
    };
    fetchHeroVideos();
  }, []);

  const heroVideo = heroVideos.length > 0
    ? heroVideos[heroSeed % heroVideos.length]
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section — plays the admin-targeted trending video when set */}
      <section className="relative bg-surface/50 dark:bg-stone-900/50 py-12 md:py-20 px-4 md:px-8 border-b border-border/40 dark:border-stone-800 overflow-hidden" aria-label="Trending hero">
        {heroVideo && (
          <>
            <video key={heroVideo} className="absolute inset-0 w-full h-full object-cover" autoPlay={!heroPaused} muted playsInline loop aria-label="Trending hero video">
              <source src={heroVideo} />
            </video>
            <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
            <button onClick={() => setHeroPaused(p => !p)} aria-label={heroPaused ? 'Play trending hero video' : 'Pause trending hero video'}
              className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 border border-white/20">
              {heroPaused ? '▶' : '⏸'}
            </button>
          </>
        )}
        <div className="container mx-auto text-center space-y-4 md:space-y-6 relative z-[1]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-rose-500/10 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-rose-500/20"
          >
            <Flame size={14} className="fill-rose-600 dark:fill-rose-400" /> {t('trendingNow.badge')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={heroVideo ? "text-4xl md:text-6xl font-serif font-black text-white" : "text-4xl md:text-6xl font-serif font-black text-dark dark:text-stone-100"}
          >
            {t('trendingNow.title')} <span className="text-primary dark:text-primary-light italic" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={heroVideo ? "text-sm md:text-base text-white/85 max-w-2xl mx-auto leading-relaxed px-4" : "text-sm md:text-base text-medium dark:text-stone-300 max-w-2xl mx-auto leading-relaxed px-4"}
          >
            {t('trendingNow.desc')}
          </motion.p>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="container mx-auto py-8 md:py-12 px-4 md:px-8 space-y-8">
        {/* Custom Tabs */}
        <div className="flex justify-center">
          <div className="flex bg-surface dark:bg-stone-800 p-1.5 rounded-full border border-stone-200/80 dark:border-stone-700 w-full md:w-auto overflow-x-auto no-scrollbar shadow-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-label={tab.label}
                className={cn(
                  "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-primary text-white dark:bg-primary-light dark:text-stone-950 shadow-md" 
                    : "text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  layout
                  key={`${activeTab}-${product._id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="relative group flex flex-col"
                >
                  <ProductCard product={product} />
                  
                  {/* Rank Badges for Top 3 */}
                  {index < 3 && (
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full shadow-lg border-none text-[10px] font-black uppercase tracking-widest text-white",
                        index === 0 ? "bg-primary dark:bg-amber-600 dark:text-stone-950" : "bg-stone-900/90 dark:bg-stone-800"
                      )}>
                        <Trophy size={12} className={index === 0 ? "fill-white" : ""} />
                        {index === 0 && t('trendingNow.trending1')}
                        {index === 1 && t('trendingNow.trending2')}
                        {index === 2 && t('trendingNow.trending3')}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface dark:bg-stone-800 text-medium dark:text-stone-400">
              <TrendingUp size={36} />
            </div>
            <h3 className="text-xl font-serif font-black text-dark dark:text-stone-100">{t('trendingNow.noTrending')}</h3>
            <p className="text-muted-foreground dark:text-stone-400 max-w-xs mx-auto text-xs">
              {t('trendingNow.noTrendingDesc')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrendingNow;
