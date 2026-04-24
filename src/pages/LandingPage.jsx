import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, ArrowRight, Sparkles, Tag, UserPlus } from 'lucide-react';
import { GiHandBag, GiHighHeel, GiNecklace, GiPresent } from 'react-icons/gi';
import { FaUserTie, FaShirt } from 'react-icons/fa6';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const CATEGORIES = [
  { label: 'Bags',        Icon: GiHandBag,  value: 'bags'        },
  { label: 'Shoes',       Icon: GiHighHeel,    value: 'shoes'       },
  { label: 'Jewelry',     Icon: GiNecklace, value: 'jewelry'     },
  { label: 'Gifts',       Icon: GiPresent,  value: 'gifts'       },
  { label: 'Accessories', Icon: FaUserTie,  value: 'accessories' },
  { label: 'Clothes',     Icon: FaShirt,    value: 'clothes'     },
];

const TRUST = [
  { Icon: Truck,       title: 'Fast Nairobi Delivery', desc: 'Same-day and next-day delivery across Nairobi.' },
  { Icon: ShieldCheck, title: 'Verified Authentic',    desc: 'Every item hand-picked and quality-checked.'   },
  { Icon: RotateCcw,   title: 'Easy Exchange',         desc: 'Hassle-free returns within 7 days.'            },
];

const LandingPage = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [featured, setFeatured]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [videos, setVideos]             = useState([]);
  const [videoIndex, setVideoIndex]     = useState(0);
  const [heroIndex, setHeroIndex]       = useState(0);
  const [direction, setDirection]       = useState(1);
  const [banners, setBanners]           = useState([]);
  const [bannerIndex, setBannerIndex]   = useState(0);

  const videoRef       = useRef(null);
  const videoInterval  = useRef(null);
  const imageInterval  = useRef(null);
  const bannerInterval = useRef(null);

  // If user is already logged in, go straight to /home
  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured');
        const products = data.data || [];
        setFeatured(products);
        setVideos(products.flatMap(p => p.videos || []));
        setBanners(products.filter(p => p.discount > 0 && p.discountBanner).slice(0, 3));
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (videos.length < 2) return;
    videoInterval.current = setInterval(() => setVideoIndex(i => (i + 1) % videos.length), 8000);
    return () => clearInterval(videoInterval.current);
  }, [videos]);

  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoIndex, videos]);

  useEffect(() => {
    if (videos.length > 0 || featured.length < 2) return;
    imageInterval.current = setInterval(() => {
      setDirection(1);
      setHeroIndex(i => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(imageInterval.current);
  }, [featured, videos]);

  useEffect(() => {
    if (banners.length < 2) return;
    bannerInterval.current = setInterval(() => setBannerIndex(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(bannerInterval.current);
  }, [banners]);

  const goToBanner = (idx) => { setBannerIndex(idx); clearInterval(bannerInterval.current); };

  const heroProduct = featured[heroIndex];

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const formatKES = (price) => new Intl.NumberFormat('en-KE', {
    style: 'currency', currency: 'KES', minimumFractionDigits: 0
  }).format(price);

  // Don't render if logged in (redirect is firing)
  if (user) return null;

  return (
    <div className="min-h-screen bg-bg">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative h-[92vh] overflow-hidden bg-surface">
        {videos.length > 0 && (
          <video
            ref={videoRef}
            key={videoIndex}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted playsInline
            loop={videos.length === 1}
            onEnded={() => { if (videos.length > 1) setVideoIndex(i => (i + 1) % videos.length); }}
          >
            <source src={videos[videoIndex]} />
          </video>
        )}

        {videos.length === 0 && (
          <AnimatePresence custom={direction} initial={false}>
            {loading ? (
              <div key="skeleton" className="absolute inset-0 bg-surface animate-pulse" />
            ) : heroProduct ? (
              <motion.div
                key={heroIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0"
              >
                <img src={heroProduct.images?.[0]} alt={heroProduct.name} className="w-full h-full object-cover" />
              </motion.div>
            ) : (
              <div key="empty" className="absolute inset-0 bg-surface" />
            )}
          </AnimatePresence>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-xl space-y-6"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Nairobi's Perfect Pick</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-black text-white leading-[1.05]">
                Your Perfect
                <br />
                <span className="text-primary italic">Pick</span> Awaits
              </h1>

              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Curated bags, shoes, jewelry & gifts — handpicked for the modern Nairobi woman.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => navigate('/register')}
                  className="btn-primary h-14 px-8 text-base rounded-2xl"
                >
                  <UserPlus size={18} className="mr-2" />
                  Get Started
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="h-14 px-6 text-white hover:text-primary hover:bg-white/10 rounded-2xl font-bold"
                >
                  Sign In
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>

              <p className="text-white/40 text-xs">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-primary underline font-bold">
                  Log in here
                </button>
              </p>
            </motion.div>
          </div>
        </div>

        {videos.length === 0 && heroProduct && (
          <motion.div
            key={`tag-${heroIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 right-8 md:right-16 z-10 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl cursor-pointer hover:bg-white transition-colors"
            onClick={() => navigate(`/products/${heroProduct._id}`)}
          >
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Featured</p>
            <p className="font-serif font-black text-dark text-sm mt-0.5">{heroProduct.name}</p>
            <p className="text-primary font-bold text-sm">{formatKES(heroProduct.price)}</p>
          </motion.div>
        )}

        {videos.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {videos.map((_, i) => (
              <button key={i} onClick={() => setVideoIndex(i)}
                className={`transition-all duration-300 rounded-full ${i === videoIndex ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SALE BANNERS ─────────────────────────────────────────── */}
      {banners.length > 0 && (
        <section className="py-16 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c08050 0%, transparent 60%)' }} />
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-10 space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Tag size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Limited Time</span>
              </div>
              <h2 className="text-4xl font-serif font-black text-white">Current Sales</h2>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {banners[bannerIndex] && (
                  <motion.div
                    key={bannerIndex}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group"
                    onClick={() => navigate('/register')}
                  >
                    <img src={banners[bannerIndex].discountBanner} alt={banners[bannerIndex].discountLabel || 'Sale'}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center px-8 md:px-16">
                      <div className="space-y-3">
                        {banners[bannerIndex].discountLabel && (
                          <span className="inline-block bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            {banners[bannerIndex].discountLabel}
                          </span>
                        )}
                        <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                          {banners[bannerIndex].discount}% Off
                        </h3>
                        <p className="text-white/80 font-bold text-lg">{banners[bannerIndex].name}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <span className="text-white/50 line-through text-sm">{formatKES(banners[bannerIndex].price)}</span>
                          <span className="text-primary font-black text-xl">
                            {formatKES(banners[bannerIndex].price * (1 - banners[bannerIndex].discount / 100))}
                          </span>
                        </div>
                        <Button className="btn-primary h-11 px-6 rounded-xl text-sm mt-2" onClick={(e) => { e.stopPropagation(); navigate('/register'); }}>
                          Sign Up to Shop <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {banners.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => goToBanner(i)}
                      className={`transition-all duration-300 rounded-full ${i === bannerIndex ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 space-y-2"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Browse by</p>
          <h2 className="text-4xl font-serif font-black text-dark">Categories</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map(({ label, Icon, value }, i) => (
            <motion.div key={value} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <button
                onClick={() => navigate('/register')}
                className="w-full group flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white shadow-sm border border-border/10 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon size={28} />
                </div>
                <span className="font-serif font-black text-dark">{label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST PILLARS ────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12 space-y-2"
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Why us</p>
            <h2 className="text-4xl font-serif font-black text-dark">Shop with Confidence</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST.map(({ Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 p-8 rounded-3xl bg-white shadow-sm border border-border/10"
              >
                <div className="p-4 bg-surface rounded-2xl text-primary flex-shrink-0"><Icon size={24} /></div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-dark text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────── */}
      <section className="mx-6 my-20 rounded-[2.5rem] overflow-hidden bg-dark relative">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c08050 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c08050 0%, transparent 50%)' }}
        />
        <div className="relative z-10 py-20 px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Perfect Pick Nairobi</p>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
              Discover your next<br />
              <span className="text-primary italic">favourite piece</span>
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
              Join thousands of Nairobi women finding their perfect style.
            </p>
          </motion.div>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => navigate('/register')} className="btn-primary h-14 px-10 text-base rounded-2xl">
              <UserPlus size={18} className="mr-2" /> Create Account
            </Button>
            <Button variant="ghost" onClick={() => navigate('/login')}
              className="h-14 px-6 text-white hover:text-primary hover:bg-white/10 rounded-2xl font-bold"
            >
              Sign In <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;