import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { FaBagShopping, FaShoePrints, FaGem, FaGift, FaUserTie, FaShirt, FaStar, FaTruck, FaShield, FaArrowsRotate } from 'react-icons/fa6';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        setFeaturedProducts(data.data?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const FALLBACK_CATEGORIES = [
    { name: 'Bags',        Icon: FaBagShopping, desc: 'Luxury leather & designer pieces',    href: '/products?category=bags'        },
    { name: 'Shoes',       Icon: FaShoePrints,  desc: 'Elegance in every step',              href: '/products?category=shoes'       },
    { name: 'Jewelry',     Icon: FaGem,         desc: 'Timeless sparkle for every occasion', href: '/products?category=jewelry'     },
    { name: 'Gifts',       Icon: FaGift,        desc: 'Perfectly wrapped thoughts',          href: '/products?category=gifts'       },
    { name: 'Accessories', Icon: FaUserTie,     desc: 'The finishing touch',                 href: '/products?category=accessories' },
    { name: 'Clothes',     Icon: FaShirt,       desc: 'Curated knitwear & fashion',          href: '/products?category=clothes'     },
  ];

  const formatCategoryLabel = (value) => value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getCategoryMeta = (value) => {
    const map = {
      bags: { Icon: FaBagShopping, desc: 'Luxury leather & designer pieces' },
      shoes: { Icon: FaShoePrints, desc: 'Elegance in every step' },
      jewelry: { Icon: FaGem, desc: 'Timeless sparkle for every occasion' },
      gifts: { Icon: FaGift, desc: 'Perfectly wrapped thoughts' },
      accessories: { Icon: FaUserTie, desc: 'The finishing touch' },
      clothes: { Icon: FaShirt, desc: 'Curated knitwear & fashion' },
      handbags: { Icon: FaBagShopping, desc: 'Chic handbags for every occasion' },
      earrings: { Icon: FaGem, desc: 'Elegant earrings to shine' },
      hairclips: { Icon: FaGem, desc: 'Stylish hair accessories' },
      keyrings: { Icon: FaGift, desc: 'Charming keyrings' },
      'phone-charms': { Icon: FaGift, desc: 'Trendy phone charms' },
      'beauty-accessories': { Icon: FaGem, desc: 'Beauty essentials' },
      'gift-boxes': { Icon: FaGift, desc: 'Curated gift boxes' },
      mugs: { Icon: FaGift, desc: 'Cozy mugs' },
      fans: { Icon: FaGift, desc: 'Elegant fans' },
      'body-mists': { Icon: FaGem, desc: 'Refreshing body mists' },
      oils: { Icon: FaGem, desc: 'Luxury oils' },
      ponchos: { Icon: FaShirt, desc: 'Cozy ponchos' },
      sweaters: { Icon: FaShirt, desc: 'Warm sweaters' },
      cardigans: { Icon: FaShirt, desc: 'Stylish cardigans' },
      watches: { Icon: FaGem, desc: 'Timeless watches' },
      rings: { Icon: FaGem, desc: 'Elegant rings' },
    };
    const meta = map[value] || { Icon: ShoppingBag, desc: 'Curated collection' };
    return { name: formatCategoryLabel(value), Icon: meta.Icon, desc: meta.desc, href: `/products?category=${value}` };
  };

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/category-groups');
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const flat = data.data.flatMap(g => g.categories);
                setCategories(flat.map(value => getCategoryMeta(value)));
            }
        } catch {
            // keep fallback for loading/error
        }
    };
    fetchCategories();
}, []);

  const stats = [
    { label: 'Curated Products', value: '500+' },
    { label: 'Happy Customers',  value: '1,000+' },
    { label: 'Avg Rating',       value: '4.9', Icon: FaStar },
  ];

  const features = [
    { Icon: FaStar,          title: 'Premium Quality',  desc: 'Only the highest grade pieces for our picks' },
    { Icon: FaTruck,         title: 'Lipa na M-Pesa',   desc: 'Fast, trusted & secure checkout'             },
    { Icon: FaShield,        title: 'Genuine Items',    desc: '100% authenticity guarantee on all items'   },
    { Icon: FaArrowsRotate,  title: 'Easy Returns',     desc: 'Stress-free 7-day exchange experience'       },
  ];

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col gap-16 lg:gap-24 pb-20">

      {/* Hero */}
      <section className="relative bg-surface/50 dark:bg-stone-900/50 rounded-b-[3rem] overflow-hidden px-4 pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 dark:border-stone-800">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="space-y-4">
              <Badge className="bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 border border-primary/20 text-xs font-black px-3.5 py-1 uppercase tracking-widest">
                <Sparkles size={12} className="mr-1.5" /> NAIROBI'S FINEST
              </Badge>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-dark dark:text-stone-100 leading-tight">
                Your <span className="text-primary dark:text-amber-300 italic">Perfect Pick</span> Always.
              </h1>
              <p className="text-base sm:text-lg text-medium dark:text-stone-300 max-w-lg leading-relaxed">
                Discover a curated collection of elegance. From statement bags to timeless jewelry and knitwear,
                we bring high-end luxury to your doorstep in Nairobi.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/products"><Button className="btn-primary h-13 px-8 text-base font-bold rounded-2xl shadow-md cursor-pointer">Shop Catalog</Button></Link>
              <Link to="/about"><Button variant="outline" className="border-stone-300 dark:border-stone-700 text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 h-13 px-8 text-base font-bold rounded-2xl cursor-pointer">Our Story</Button></Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-2 gap-4">
            {[FaBagShopping, FaShoePrints, FaGem, FaShirt].map((Icon, i) => (
              <motion.div key={i} whileHover={{ scale: 1.04, rotate: i % 2 === 0 ? 2 : -2 }}
                className="aspect-square rounded-3xl flex items-center justify-center shadow-lg bg-card/80 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700/80 text-primary dark:text-amber-300"
              >
                <Icon size={72} />
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 sm:px-6 -mt-16 md:-mt-20 relative z-20">
        <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row justify-around items-center gap-4 md:gap-0 border border-stone-800">
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              <div className="text-center px-6">
                <div className="text-3xl font-serif font-black text-amber-400 flex items-center justify-center gap-2">
                  {stat.value}
                  {stat.Icon && <stat.Icon size={18} className="text-amber-400" />}
                </div>
                <div className="text-xs text-stone-400 uppercase tracking-widest font-black mt-0.5">{stat.label}</div>
              </div>
              {i < stats.length - 1 && (
                <>
                  <div className="hidden md:block h-12 w-px bg-stone-800" />
                  <div className="md:hidden w-full h-px bg-stone-800" />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Shop by Category</h2>
          <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest">Find your favorite luxury essentials</p>
        </div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {categories.map(({ name, Icon, desc, href }, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Link to={href} className="group block h-full">
                <Card className="h-full border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-lg hover:border-primary/40 dark:hover:border-amber-400/40 transition-all duration-300 rounded-3xl bg-card text-card-foreground">
                  <CardContent className="p-6 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface dark:bg-stone-800 flex items-center justify-center text-primary dark:text-amber-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-stone-950 transition-all duration-300 border border-stone-200/50 dark:border-stone-700">
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-dark dark:text-stone-100">{name}</h3>
                      <p className="text-[11px] text-muted-foreground dark:text-stone-400 mt-1 leading-tight line-clamp-2">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface/40 dark:bg-stone-900/40 py-16 border-y border-border/40 dark:border-stone-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-10 pb-4 border-b border-border/40 dark:border-stone-800">
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Featured Picks</h2>
              <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest">Hand-selected luxury catalog</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-primary dark:text-amber-300 hover:text-primary-hover group font-bold text-xs uppercase tracking-wider">
                View All <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => <ProductCard key={product._id} product={product} />)
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground dark:text-stone-400 italic">
                Our curated collections are being refreshed. Check back shortly!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ Icon, title, desc }, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-card text-card-foreground border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 rounded-2xl border border-primary/20">
                <Icon size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-dark dark:text-stone-100">{title}</h3>
              <p className="text-xs text-muted-foreground dark:text-stone-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 dark:bg-stone-950 rounded-[3rem] p-8 sm:p-14 text-center space-y-10 border border-stone-800 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-100">Our Clients Love Us</h2>
            <p className="text-xs text-stone-400 uppercase font-black tracking-widest">Verified reviews from fashion lovers across Nairobi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Amara K.',   text: 'Absolutely love my new bag! The quality is unmatched and delivery in Nairobi was so fast.' },
              { name: 'Zara M.',    text: 'Found the most beautiful jewelry here. Perfect Pick has become my favourite store in Nairobi!' },
              { name: 'Fatima W.',  text: 'Amazing experience from browsing to delivery. The packaging was gorgeous too!' },
            ].map(({ name, text }, i) => (
              <div key={i} className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700/60 text-left space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {Array(5).fill(0).map((_, j) => <FaStar key={j} size={14} />)}
                </div>
                <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-stone-200 font-bold text-xs">{name}</p>
                    <p className="text-stone-400 text-[10px] uppercase font-mono">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <motion.div whileHover={{ scale: 1.005 }}
          className="btn-primary rounded-[3rem] p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl text-white"
        >
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black max-w-2xl mx-auto leading-tight">
              Ready to find your next favorite luxury piece?
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Join 1,000+ satisfied customers and shop our latest verified Nairobi collection today.
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button className="bg-white text-stone-900 hover:bg-stone-100 h-13 px-8 text-sm font-black rounded-full shadow-lg cursor-pointer">
                  Shop the Collection
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;