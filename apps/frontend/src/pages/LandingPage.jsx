import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, ArrowRight, Sparkles, Tag, UserPlus } from 'lucide-react';
import { GiHandBag, GiHighHeel, GiNecklace, GiPresent } from 'react-icons/gi';
import { FaUserTie, FaShirt } from 'react-icons/fa6';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const FALLBACK_CATEGORIES = [
  { label: 'Bags',        Icon: GiHandBag,  value: 'bags'        },
  { label: 'Shoes',       Icon: GiHighHeel,    value: 'shoes'       },
  { label: 'Jewelry',     Icon: GiNecklace, value: 'jewelry'     },
  { label: 'Gifts',       Icon: GiPresent,  value: 'gifts'       },
  { label: 'Accessories', Icon: FaUserTie,  value: 'accessories' },
  { label: 'Clothes',     Icon: FaShirt,    value: 'clothes'     },
];

const formatCategoryLabel = (value) => value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const getIconForCategory = (value) => {
  const map = {
    bags: GiHandBag, shoes: GiHighHeel, jewelry: GiNecklace, gifts: GiPresent, accessories: FaUserTie, clothes: FaShirt,
    handbags: GiHandBag, earrings: GiNecklace, hairclips: GiPresent, keyrings: GiPresent, 'phone-charms': GiPresent,
    'beauty-accessories': FaUserTie, 'gift-boxes': GiPresent, mugs: GiPresent, fans: GiPresent, 'body-mists': GiNecklace,
    oils: GiNecklace, ponchos: FaShirt, sweaters: FaShirt, cardigans: FaShirt, watches: GiNecklace, rings: GiNecklace,
  };
  return map[value] || ShoppingBag;
};

const TRUST = [
  { Icon: Truck,       title: 'Fast Nairobi Delivery', desc: 'Same-day and next-day delivery across Nairobi.', link: '/shipping' },
  { Icon: ShieldCheck, title: 'Verified Authentic',    desc: 'Every item hand-picked and quality-checked.',   link: '/about'    },
  { Icon: RotateCcw,   title: 'Easy Exchange',         desc: 'Hassle-free returns within 7 days.',          link: '/refund'   },
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
  const [categories, setCategories]     = useState(FALLBACK_CATEGORIES);
  // Hero video controls: pause/play + mute. Persist pause preference.
  const [heroPaused, setHeroPaused] = useState(() => {
    try { return localStorage.getItem('pp-hero-paused') === '1'; } catch { return false; }
  });
  const [heroMuted, setHeroMuted] = useState(true);

  const videoRef       = useRef(null);
  const videoInterval  = useRef(null);
  const imageInterval  = useRef(null);
  const bannerInterval = useRef(null);
  const pageRef        = useRef(null);

  // If user is already logged in, go straight to /home
  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        const products = data.data || [];
        setFeatured(products);
        // Hero videos: prefer product videos explicitly targeted at the
        // landing page (heroPages includes 'landing' or is unset/legacy),
        // so admins can assign videos to Landing / Trending / etc.
        const landingVideos = products.flatMap(p => {
          const pages = p.heroPages;
          const targeted = !pages || pages.length === 0 || pages.includes('landing');
          return targeted ? (p.videos || []) : [];
        });
        setVideos(landingVideos);
        // 24-hour schedule: pick the starting video from the day number so
        // the hero rotates daily, then advances every 8s within the day.
        if (landingVideos.length > 0) {
          const dayNumber = Math.floor(Date.now() / 86400000);
          setVideoIndex(dayNumber % landingVideos.length);
        }
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
    if (videos.length < 2 || heroPaused) return;
    videoInterval.current = setInterval(() => setVideoIndex(i => (i + 1) % videos.length), 8000);
    return () => clearInterval(videoInterval.current);
  }, [videos, heroPaused]);

  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load();
      if (!heroPaused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [videoIndex, videos, heroPaused]);

  useEffect(() => {
    try { localStorage.setItem('pp-hero-paused', heroPaused ? '1' : '0'); } catch { /* ignore */ }
  }, [heroPaused]);

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

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/category-groups');
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const flat = data.data.flatMap(g => g.categories);
                const mapped = flat.map(value => ({
                    label: formatCategoryLabel(value),
                    value,
                    Icon: getIconForCategory(value),
                }));
                setCategories(mapped);
            }
        } catch {
            // keep fallback
        }
    };
    fetchCategories();
}, []);

  const goToBanner = (idx) => { setBannerIndex(idx); clearInterval(bannerInterval.current); };

  // GSAP polish — subtle reveals, respects reduced motion, no functional change
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.landing-category', {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.2,
      });
      gsap.from('.landing-trust', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.4,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [featured]);

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
    <div ref={pageRef} className="min-h-screen bg-bg">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative h-[92vh] overflow-hidden bg-surface" aria-label="Featured collection hero">
        {videos.length > 0 && (
          <video
            ref={videoRef}
            key={videoIndex}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={!heroPaused} muted={heroMuted} playsInline
            loop={videos.length === 1}
            aria-label={`Hero video ${videoIndex + 1} of ${videos.length}`}
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
            className="absolute bottom-24 right-8 md:right-16 z-10 bg-card/95 text-card-foreground backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl cursor-pointer hover:bg-card transition-colors border border-stone-200/70 dark:border-stone-800"
            onClick={() => navigate(`/products/${heroProduct._id}`)}
          >
            <p className="text-[10px] text-muted-foreground dark:text-stone-400 font-bold uppercase tracking-wider">Featured Pick</p>
            <p className="font-serif font-black text-dark dark:text-stone-100 text-sm mt-0.5">{heroProduct.name}</p>
            <p className="text-primary dark:text-amber-300 font-black text-sm">{formatKES(heroProduct.price)}</p>
          </motion.div>
        )}

        {videos.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {videos.map((_, i) => (
              <button key={i} onClick={() => setVideoIndex(i)} aria-label={`Show hero video ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${i === videoIndex ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
            {/* Pause / play + mute controls for the rotating hero video */}
            <button onClick={() => setHeroPaused(p => !p)} aria-label={heroPaused ? 'Play hero video' : 'Pause hero video'}
              className="ml-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 border border-white/20">
              {heroPaused ? '▶' : '⏸'}
            </button>
            <button onClick={() => setHeroMuted(m => !m)} aria-label={heroMuted ? 'Unmute hero video' : 'Mute hero video'}
              className="w-8 h-8 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 border border-white/20">
              {heroMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}
        {videos.length === 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            <button onClick={() => setHeroPaused(p => !p)} aria-label={heroPaused ? 'Play hero video' : 'Pause hero video'}
              className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 border border-white/20">
              {heroPaused ? '▶' : '⏸'}
            </button>
          </div>
        )}
      </section>

      {/* ── SALE BANNERS ─────────────────────────────────────────── */}
      {banners.length > 0 && (
        <section className="py-16 bg-stone-900 dark:bg-stone-950 relative overflow-hidden border-y border-stone-800">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c08050 0%, transparent 60%)' }} />
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-10 space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Tag size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Limited Time Exclusive</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-100">Current Sales</h2>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {banners[bannerIndex] && (
                  <motion.div
                    key={bannerIndex}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group border border-stone-800"
                    onClick={() => navigate('/register')}
                  >
                    <img src={banners[bannerIndex].discountBanner} alt={banners[bannerIndex].discountLabel || 'Sale'}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center px-8 md:px-16">
                      <div className="space-y-3">
                        {banners[bannerIndex].discountLabel && (
                          <span className="inline-block bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                            {banners[bannerIndex].discountLabel}
                          </span>
                        )}
                        <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                          {banners[bannerIndex].discount}% Off
                        </h3>
                        <p className="text-white/90 font-bold text-base sm:text-lg">{banners[bannerIndex].name}</p>
                        <div className="flex items-center gap-4 pt-1">
                          <span className="text-white/50 line-through text-sm">{formatKES(banners[bannerIndex].price)}</span>
                          <span className="text-amber-400 font-black text-xl">
                            {formatKES(banners[bannerIndex].price * (1 - banners[bannerIndex].discount / 100))}
                          </span>
                        </div>
                        <Button className="btn-primary h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer shadow-md" onClick={(e) => { e.stopPropagation(); navigate('/register'); }}>
                          Sign Up to Shop <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {banners.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => goToBanner(i)} aria-label={`Show sale banner ${i + 1}`}
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
      <section className="py-16 lg:py-24 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 space-y-2"
        >
          <p className="text-primary dark:text-amber-300 text-xs font-black uppercase tracking-[0.3em]">Curated Picks</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Browse Categories</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map(({ label, Icon, value }, i) => (
            <motion.div key={value} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="landing-category">
              <button
                onClick={() => navigate('/register')}
                className="w-full group flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-card text-card-foreground shadow-[0_4px_16px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-stone-200/70 dark:border-stone-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface dark:bg-stone-800 flex items-center justify-center text-primary dark:text-amber-300 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-stone-950 transition-all duration-300 border border-stone-200/50 dark:border-stone-700">
                  <Icon size={26} />
                </div>
                <span className="font-serif font-black text-dark dark:text-stone-100 text-sm tracking-tight">{label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST PILLARS ────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-surface/50 dark:bg-stone-900/50 border-t border-border/40 dark:border-stone-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12 space-y-2"
          >
            <p className="text-primary dark:text-amber-300 text-xs font-black uppercase tracking-[0.3em]">Our Promise</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Shop with Confidence</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST.map(({ Icon, title, desc, link }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="landing-trust">
                <Link 
                  to={link}
                  className="flex items-start gap-4 p-6 sm:p-7 rounded-3xl bg-card text-card-foreground shadow-[0_4px_16px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-stone-200/70 dark:border-stone-800 hover:shadow-lg hover:border-primary/40 dark:hover:border-amber-400/40 transition-all duration-300 h-full group"
                >
                  <div className="p-3.5 bg-surface dark:bg-stone-800 rounded-2xl text-primary dark:text-amber-300 shrink-0 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-stone-950 transition-colors border border-stone-200/50 dark:border-stone-700"><Icon size={22} /></div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-serif font-black text-dark dark:text-stone-100 text-base group-hover:text-primary dark:group-hover:text-amber-300 transition-colors">{title}</h3>
                    <p className="text-muted-foreground dark:text-stone-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────── */}
      <section className="mx-4 sm:mx-6 my-16 rounded-[2.5rem] overflow-hidden bg-stone-900 dark:bg-stone-950 relative border border-stone-800 shadow-2xl">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c08050 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c08050 0%, transparent 50%)' }}
        />
        <div className="relative z-10 py-16 px-6 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-3">
            <p className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Perfect Pick Nairobi</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-100 leading-tight">
              Discover your next<br />
              <span className="text-primary dark:text-amber-300 italic">favourite luxury piece</span>
            </h2>
            <p className="text-stone-400 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              Join stylish fashion enthusiasts across Nairobi finding their authentic style.
            </p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button onClick={() => navigate('/register')} className="btn-primary h-13 px-8 text-sm font-bold rounded-2xl shadow-md cursor-pointer">
              <UserPlus size={16} className="mr-2" /> Create Account
            </Button>
            <Button variant="ghost" onClick={() => navigate('/login')}
              className="h-13 px-6 text-stone-200 hover:text-white hover:bg-stone-800 rounded-2xl font-bold text-sm cursor-pointer"
            >
              Sign In <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;