import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { FaBagShopping, FaShoePrints, FaGem, FaGift, FaUserTie, FaShirt, FaStar, FaTruck, FaShield, FaArrowsRotate } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const { t } = useTranslation();
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
    { name: 'Bags',        Icon: FaBagShopping, descKey: 'home.categories.bags',    href: '/products?category=bags'        },
    { name: 'Shoes',       Icon: FaShoePrints,  descKey: 'home.categories.shoes',   href: '/products?category=shoes'       },
    { name: 'Jewelry',     Icon: FaGem,         descKey: 'home.categories.jewelry', href: '/products?category=jewelry'     },
    { name: 'Gifts',       Icon: FaGift,        descKey: 'home.categories.gifts',   href: '/products?category=gifts'       },
    { name: 'Accessories', Icon: FaUserTie,     descKey: 'home.categories.accessories', href: '/products?category=accessories' },
    { name: 'Clothes',     Icon: FaShirt,       descKey: 'home.categories.clothes', href: '/products?category=clothes'     },
  ];

  const formatCategoryLabel = (value) => value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getCategoryMeta = (value) => {
    const descKeyMap = {
      bags: 'home.categories.bags', shoes: 'home.categories.shoes', jewelry: 'home.categories.jewelry',
      gifts: 'home.categories.gifts', accessories: 'home.categories.accessories', clothes: 'home.categories.clothes',
      handbags: 'home.categories.handbags', earrings: 'home.categories.earrings', hairclips: 'home.categories.hairclips',
      keyrings: 'home.categories.keyrings', 'phone-charms': 'home.categories.phoneCharms',
      'beauty-accessories': 'home.categories.beautyAccessories', 'gift-boxes': 'home.categories.gifts',
      mugs: 'home.categories.mugs', fans: 'home.categories.fans', 'body-mists': 'home.categories.bodyMists',
      oils: 'home.categories.oils', ponchos: 'home.categories.ponchos', sweaters: 'home.categories.sweaters',
      cardigans: 'home.categories.cardigans', watches: 'home.categories.watches', rings: 'home.categories.rings',
    };
    const iconMap = {
      bags: FaBagShopping, shoes: FaShoePrints, jewelry: FaGem, gifts: FaGift,
      accessories: FaUserTie, clothes: FaShirt, handbags: FaBagShopping, earrings: FaGem,
      hairclips: FaGem, keyrings: FaGift, 'phone-charms': FaGift, 'beauty-accessories': FaGem,
      'gift-boxes': FaGift, mugs: FaGift, fans: FaGift, 'body-mists': FaGem, oils: FaGem,
      ponchos: FaShirt, sweaters: FaShirt, cardigans: FaShirt, watches: FaGem, rings: FaGem,
    };
    const Icon = iconMap[value] || ShoppingBag;
    const descKey = descKeyMap[value] || 'home.categories.default';
    return { name: formatCategoryLabel(value), Icon, descKey, href: `/products?category=${value}` };
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
    { labelKey: 'home.stats.curatedProducts', value: '500+' },
    { labelKey: 'home.stats.happyCustomers',  value: '100+' },
  ];

  const features = [
    { Icon: FaStar,          titleKey: 'home.whyChooseUs.premiumQuality',  descKey: 'home.whyChooseUs.premiumQualityDesc' },
    { Icon: FaTruck,         titleKey: 'home.whyChooseUs.lipaMpesa',       descKey: 'home.whyChooseUs.lipaMpesaDesc' },
    { Icon: FaShield,        titleKey: 'home.whyChooseUs.genuineItems',    descKey: 'home.whyChooseUs.genuineItemsDesc' },
    { Icon: FaArrowsRotate,  titleKey: 'home.whyChooseUs.easyReturns',     descKey: 'home.whyChooseUs.easyReturnsDesc' },
  ];

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const testimonials = [
    { name: 'Amara K.',   key: 'amara' },
    { name: 'Zara M.',    key: 'zara' },
    { name: 'Fatima W.',  key: 'fatima' },
  ];

  const testimonialTexts = {
    en: {
      amara: 'Absolutely love my new bag! The quality is unmatched and delivery in Nairobi was so fast.',
      zara: 'Found the most beautiful jewelry here. Perfect Pick has become my favourite store in Nairobi!',
      fatima: 'Amazing experience from browsing to delivery. The packaging was gorgeous too!',
    },
    sw: {
      amara: 'Ninapenda sana mfuko wangu mpya! Ubora hauwezi kulinganishwa na uwasilishaji Nairobi ulikuwa haraka sana.',
      zara: 'Nilipata vito vizuri zaidi hapa. Perfect Pick imekuwa duka langu pendwa Nairobi!',
      fatima: 'Uzoefu wa ajabu kutoka kukagua hadi uwasilishaji. ufungashaji pia ulikuwa mzuri!',
    },
  };

  return (
    <div className="flex flex-col gap-16 lg:gap-24 pb-20">

      {/* Hero */}
      <section className="relative bg-surface/50 dark:bg-stone-900/50 rounded-b-[3rem] overflow-hidden px-4 pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 dark:border-stone-800">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="space-y-4">
              <Badge className="bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 border border-primary/20 text-xs font-black px-3.5 py-1 uppercase tracking-widest">
                <Sparkles size={12} className="mr-1.5" /> {t('home.heroBadge')}
              </Badge>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black text-dark dark:text-stone-100 leading-tight">
                {t('home.heroTitle1')} <span className="text-primary dark:text-amber-300 italic">{t('home.heroTitleHighlight')}</span> {t('home.heroTitle2')}
              </h1>
              <p className="text-base sm:text-lg text-medium dark:text-stone-300 max-w-lg leading-relaxed">
                {t('home.heroDesc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/products"><Button className="btn-primary h-13 px-8 text-base font-bold rounded-2xl shadow-md cursor-pointer">{t('home.shopCatalog')}</Button></Link>
              <Link to="/about"><Button variant="outline" className="border-stone-300 dark:border-stone-700 text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 h-13 px-8 text-base font-bold rounded-2xl cursor-pointer">{t('home.ourStory')}</Button></Link>
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
        <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row justify-around items-center gap-6 border border-stone-800">
          {stats.map((stat, i) => (
            <div key={i} className="text-center md:border-r last:border-0 border-stone-800 pr-0 md:pr-10 w-full md:w-auto last:pr-0">
              <div className="text-3xl font-serif font-black text-amber-400">
                {stat.value}
              </div>
              <div className="text-xs text-stone-400 uppercase tracking-widest font-black mt-0.5">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">{t('home.shopByCategory')}</h2>
          <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest">{t('home.findYourFavorite')}</p>
        </div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {categories.map(({ name, Icon, descKey, href }, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Link to={href} className="group block h-full">
                <Card className="h-full border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-lg hover:border-primary/40 dark:hover:border-amber-400/40 transition-all duration-300 rounded-3xl bg-card text-card-foreground">
                  <CardContent className="p-6 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface dark:bg-stone-800 flex items-center justify-center text-primary dark:text-amber-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-stone-950 transition-all duration-300 border border-stone-200/50 dark:border-stone-700">
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-dark dark:text-stone-100">{name}</h3>
                      <p className="text-[11px] text-muted-foreground dark:text-stone-400 mt-1 leading-tight line-clamp-2">{t(descKey)}</p>
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
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">{t('home.featuredPicks')}</h2>
              <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest">{t('home.handSelected')}</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-primary dark:text-amber-300 hover:text-primary-hover group font-bold text-xs uppercase tracking-wider">
                {t('home.viewAll')} <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
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
                {t('home.refreshingSoon')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ Icon, titleKey, descKey }, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-card text-card-foreground border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 rounded-2xl border border-primary/20">
                <Icon size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-dark dark:text-stone-100">{t(titleKey)}</h3>
              <p className="text-xs text-muted-foreground dark:text-stone-400 leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 dark:bg-stone-950 rounded-[3rem] p-8 sm:p-14 text-center space-y-10 border border-stone-800 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-100">{t('home.testimonials.title')}</h2>
            <p className="text-xs text-stone-400 uppercase font-black tracking-widest">{t('home.testimonials.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, key }, i) => (
              <div key={i} className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700/60 text-left space-y-4">

                <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">"{t(`testimonials.${key}`, { ns: 'translation', defaultValue: testimonialTexts.en[key] })}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-stone-200 font-bold text-xs">{name}</p>
                    <p className="text-stone-400 text-[10px] uppercase font-mono">{t('home.testimonials.verifiedBuyer')}</p>
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
              {t('home.cta.title')}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {t('home.cta.desc')}
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button className="bg-white text-stone-900 hover:bg-stone-100 h-13 px-8 text-sm font-black rounded-full shadow-lg cursor-pointer">
                  {t('home.cta.button')}
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
