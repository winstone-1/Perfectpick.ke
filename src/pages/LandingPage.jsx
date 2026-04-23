import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { GiHandBag, GiHeels, GiNecklace, GiPresent } from 'react-icons/gi';
import { FaUserTie, FaShirt } from 'react-icons/fa6';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';

const CATEGORIES = [
  { label: 'Bags',        Icon: GiHandBag,  value: 'bags'        },
  { label: 'Shoes',       Icon: GiHeels,    value: 'shoes'       },
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
  const navigate = useNavigate();
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef               = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data.data || []);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (featured.length < 2) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setHeroIndex(i => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [featured]);

  const goTo = (idx) => {
    setDirection(idx > heroIndex ? 1 : -1);
    setHeroIndex(idx);
    clearInterval(intervalRef.current);
  };

  const heroProduct = featured[heroIndex];

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-bg">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[92vh] overflow-hidden bg-surface">
        <AnimatePresence custom={direction} initial={false}>
          {loading ? (
            <div key="skeleton" className="absolute inset-0 bg-surface animate-pulse" />
          ) : heroProduct ? (
            <motion.div
              key={heroIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroProduct.images?.[0]}
                alt={heroProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            </motion.div>
          ) : (
            <div key="empty" className="absolute inset-0 bg-surface" />
          )}
        </AnimatePresence>

        {/* Hero text */}
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
                <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
                  Nairobi's Boutique
                </span>
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
                  onClick={() => navigate('/home')}
                  className="btn-primary h-14 px-8 text-base rounded-2xl"
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Enter Store
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/products?sort=newest')}
                  className="h-14 px-6 text-white hover:text-primary hover:bg-white/10 rounded-2xl font-bold"
                >
                  New Arrivals
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product name tag */}
        {heroProduct && (
          <motion.div
            key={`tag-${heroIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 right-8 md:right-16 z-10 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl cursor-pointer hover:bg-white transition-colors"
            onClick={() => navigate(`/products/${heroProduct._id}`)}
          >
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Featured</p>
            <p className="font-serif font-black text-dark text-sm mt-0.5">{heroProduct.name}</p>
            <p className="text-primary font-bold text-sm">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(heroProduct.price)}
            </p>
          </motion.div>
        )}

        {/* Dot indicators */}
        {featured.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === heroIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-2"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Browse by</p>
          <h2 className="text-4xl font-serif font-black text-dark">Categories</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map(({ label, Icon, value }, i) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/products?category=${value}`}
                className="group flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white shadow-sm border border-border/10 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 text-2xl">
                  <Icon size={28} />
                </div>
                <span className="font-serif font-black text-dark">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST PILLARS ────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-2"
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Why us</p>
            <h2 className="text-4xl font-serif font-black text-dark">Shop with Confidence</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 p-8 rounded-3xl bg-white shadow-sm border border-border/10"
              >
                <div className="p-4 bg-surface rounded-2xl text-primary flex-shrink-0">
                  <Icon size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-dark text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────── */}
      <section className="mx-6 my-20 rounded-[2.5rem] overflow-hidden bg-dark relative">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #c08050 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c08050 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 py-20 px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Perfect Pick Nairobi</p>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
              Discover your next
              <br />
              <span className="text-primary italic">favourite piece</span>
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
              Bags, shoes, jewelry, and gifts — curated with love for you.
            </p>
          </motion.div>
          <Button
            onClick={() => navigate('/home')}
            className="btn-primary h-14 px-10 text-base rounded-2xl"
          >
            <ShoppingBag size={18} className="mr-2" />
            Enter the Store
          </Button>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;