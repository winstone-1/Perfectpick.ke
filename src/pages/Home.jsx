import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Truck, Shield, RefreshCw, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { FaBagShopping, FaShoePrints, FaGem, FaGift, FaUserTie, FaShirt } from 'react-icons/fa6';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        // The backend returns { success: true, data: [...] }
        setFeaturedProducts(data.data?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Bags', icon: <FaBagShopping />, desc: 'Luxury leather & designer pieces', href: '/products?category=bags' },
    { name: 'Shoes', icon: <FaShoePrints />, desc: 'Elegance in every step', href: '/products?category=shoes' },
    { name: 'Jewelry', icon: <FaGem />, desc: 'Timeless sparkle for every occasion', href: '/products?category=jewelry' },
    { name: 'Gifts', icon: <FaGift />, desc: 'Perfectly wrapped thoughts', href: '/products?category=gifts' },
    { name: 'Accessories', icon: <FaUserTie />, desc: 'The finishing touch', href: '/products?category=accessories' },
    { name: 'Clothes', icon: <FaShirt />, desc: 'Curated fashion boutique', href: '/products?category=clothes' },
  ];

  const stats = [
    { label: 'Products', value: '500+' },
    { label: 'Happy Customers', value: '1,000+' },
    { label: 'Avg Rating', value: '4.9 ⭐' },
  ];

  const features = [
    { icon: <Star />, title: 'Premium Quality', desc: 'Only the best for our picks' },
    { icon: <Truck />, title: 'Lipa na M-Pesa', desc: 'Fast & Secure checkout' },
    { icon: <Shield />, title: 'Genuine Items', desc: '100% authenticity guaranteed' },
    { icon: <RefreshCw />, title: 'Easy Returns', desc: 'Stress-free experience' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-surface rounded-b-[3rem] overflow-hidden px-4 pt-12 pb-24 md:pt-24 md:pb-32">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none text-xs font-bold px-3 py-1">NAIROBI'S FINEST BOUTIQUE</Badge>
              <h1 className="text-5xl md:text-7xl font-serif font-black text-dark leading-tight">
                Your <span className="text-primary italic">Perfect Pick</span> Always.
              </h1>
              <p className="text-lg text-medium max-w-lg leading-relaxed">
                Discover a curated collection of elegance. From statement bags to timeless jewelry, 
                we bring the world's beauty to your doorstep in Nairobi.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="btn-primary h-14 px-8 text-lg">Shop Now</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="btn-outline h-14 px-8 text-lg">Our Story</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="grid grid-cols-2 gap-4"
          >
            {[ <FaBagShopping />, <FaShoePrints />, <FaGem />, <FaShirt /> ].map((icon, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                className="aspect-square glass rounded-3xl flex items-center justify-center text-7xl md:text-8xl shadow-xl text-primary"
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-dark text-footer-text rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-around items-center gap-8 border border-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center md:border-r last:border-0 border-white/20 pr-0 md:pr-12 w-full md:w-auto last:pr-0">
              <div className="text-3xl font-serif font-bold text-primary">{stat.value}</div>
              <div className="text-sm opacity-60 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-4xl font-serif font-bold">Shop by Category</h2>
          <p className="text-muted-foreground">Find the perfect accessory for every style</p>
        </div>
        <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {categories.map((cat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Link to={cat.href} className="group block h-full">
                <div className="h-full bg-white rounded-2xl p-6 text-center border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-4">
                  <div className="text-4xl group-hover:scale-125 transition-transform duration-300 text-primary">{cat.icon}</div>
                  <div>
                    <h3 className="font-serif font-bold text-lg">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold">New Arrivals</h2>
              <p className="text-muted-foreground">Explore our freshest luxury picks</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-primary hover:text-primary-hover group">
                View All <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-40 italic">
                Our curated collections are arriving soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white border border-border/10 shadow-sm text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-xl mb-4">
                {React.cloneElement(feat.icon, { size: 24 })}
              </div>
              <h3 className="text-lg font-serif font-bold">{feat.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4">
        <div className="bg-dark rounded-[3rem] p-12 md:p-20 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-bold text-footer-text">Our Clients Love Us</h2>
            <p className="text-footer-text/60">Hear from our community in Nairobi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 text-left space-y-4">
                <div className="flex text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-footer-text/80 italic leading-relaxed">
                  "Absolutely love my new bag! The quality is unmatched and the delivery in Nairobi was so fast. Perfect Pick is my go-to now."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">A</div>
                  <div>
                    <p className="text-footer-text font-bold text-sm">Amara K.</p>
                    <p className="text-footer-text/40 text-[10px] uppercase">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-primary rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl mx-auto leading-tight">
              Ready to find your next favorite piece?
            </h2>
            <p className="text-white/80 max-w-sm mx-auto">
              Join 1000+ happy customers and shop our latest collection today.
            </p>
            <Link to="/products">
              <Button className="bg-white text-primary hover:bg-surface h-14 px-10 text-lg font-bold rounded-full mt-4">
                Shop the Collection
              </Button>
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>
      </section>
    </div>
  );
};



export default Home;
