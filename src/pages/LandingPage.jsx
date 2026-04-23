import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight, 
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeaturedProducts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const categories = [
    { name: 'Bags', icon: '👜', href: '/products?category=bags', color: 'bg-orange-50' },
    { name: 'Shoes', icon: '👠', href: '/products?category=shoes', color: 'bg-blue-50' },
    { name: 'Jewelry', icon: '✨', href: '/products?category=jewelry', color: 'bg-purple-50' },
    { name: 'Gifts', icon: '🎁', href: '/products?category=gifts', color: 'bg-red-50' },
  ];

  const trustCards = [
    { 
      icon: <Truck size={32} />, 
      title: 'Fast Nairobi Delivery', 
      desc: 'Same day delivery within Nairobi and 24h nationwide.' 
    },
    { 
      icon: <ShieldCheck size={32} />, 
      title: 'Verified Authentic', 
      desc: '100% genuine products sourced from authorized retailers.' 
    },
    { 
      icon: <RotateCcw size={32} />, 
      title: 'Easy Exchange', 
      desc: 'Hassle-free 7-day exchange policy for your peace of mind.' 
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] overflow-hidden bg-dark">
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="skeleton" className="absolute inset-0 bg-surface/10 animate-pulse" />
          ) : featuredProducts.length > 0 ? (
            <motion.div
              key={featuredProducts[currentSlide]._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={featuredProducts[currentSlide].images?.[0] || featuredProducts[currentSlide].image} 
                  alt={featuredProducts[currentSlide].name}
                  className="w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="max-w-2xl space-y-8"
                >
                  <div className="space-y-4">
                    <Badge className="bg-primary text-white border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                      Featured Collection
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-serif font-black text-white leading-tight">
                      Find Your <span className="text-primary italic">Perfect Pick</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                      {featuredProducts[currentSlide].description.slice(0, 120)}...
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <Link to="/products">
                      <Button className="btn-primary h-16 px-10 text-lg font-black rounded-full shadow-2xl hover:scale-105 transition-transform">
                        Shop Now <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                    <Link to="/products?sort=newest">
                      <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-16 px-10 text-lg font-black rounded-full">
                        View New Arrivals
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div key="empty" className="absolute inset-0 flex items-center justify-center bg-surface">
              <p className="text-muted-foreground italic">Welcome to Perfect Pick Nairobi</p>
            </div>
          )}
        </AnimatePresence>

        {/* Carousel Indicators */}
        {featuredProducts.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {featuredProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  currentSlide === i ? 'w-10 bg-primary' : 'w-4 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Categories Showcase */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-black text-dark">Shop by Category</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.href} className="group">
                <motion.div
                  whileHover={{ y: -10 }}
                  className={`aspect-[4/5] rounded-[2.5rem] ${cat.color} flex flex-col items-center justify-center p-8 transition-shadow hover:shadow-2xl border border-transparent hover:border-primary/10`}
                >
                  <span className="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                  </span>
                  <h3 className="text-2xl font-serif font-black text-dark">{cat.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore All
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products Strip */}
      <section className="py-24 bg-surface/50 border-y border-border/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-black text-dark">New Arrivals</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Freshly curated just for you</p>
            </div>
            <Link to="/products" className="hidden md:block">
              <Button variant="ghost" className="text-primary hover:text-primary-hover font-black uppercase tracking-widest text-xs group">
                See everything <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide -mx-4 px-4 snap-x">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="min-w-[280px] w-[280px] snap-start space-y-4">
                  <Skeleton className="aspect-square w-full rounded-3xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : featuredProducts.map((product) => (
              <div key={product._id} className="min-w-[280px] w-[280px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="md:hidden mt-8 text-center">
            <Link to="/products">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Shop With Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {trustCards.map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center space-y-6 group"
              >
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {card.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif font-black text-dark">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed px-4">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer CTA Banner */}
      <section className="container mx-auto px-4 pb-24">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-dark rounded-[3rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight max-w-3xl mx-auto">
              Discover your next <span className="text-primary italic">favourite piece</span>
            </h2>
            <p className="text-footer-text/60 text-lg max-w-md mx-auto leading-relaxed">
              Join thousands of stylish shoppers in Nairobi. Curated quality, guaranteed authenticity.
            </p>
            <Link to="/products">
              <Button className="btn-primary h-16 px-12 text-lg font-black rounded-full shadow-xl hover:scale-105 transition-transform mt-6">
                Shop Now
              </Button>
            </Link>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
