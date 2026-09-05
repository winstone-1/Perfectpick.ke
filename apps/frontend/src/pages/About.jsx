import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles, Truck, RotateCcw, MessageCircle } from 'lucide-react';
import { FaCrown, FaInstagram, FaXTwitter, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const contactInfos = [
    { 
      icon: <MapPin className="text-primary dark:text-amber-300" size={22} />, 
      title: 'Visit Us', 
      detail: 'Nairobi Commercial Center, Floor 2, Nairobi, Kenya',
      link: null 
    },
    { 
      icon: <Phone className="text-primary dark:text-amber-300" size={22} />, 
      title: 'Call Us', 
      detail: '+254 787 251 690',
      link: 'tel:+254787251690' 
    },
    { 
      icon: <Mail className="text-primary dark:text-amber-300" size={22} />, 
      title: 'Email Us', 
      detail: 'perfectpick26@gmail.com',
      link: 'mailto:perfectpick26@gmail.com' 
    },
    { 
      icon: <Clock className="text-primary dark:text-amber-300" size={22} />, 
      title: 'Working Hours', 
      detail: 'Mon - Sat: 8:30 AM - 7:30 PM\nSun & Holidays: 10:30 AM - 6:00 PM',
      link: null 
    }
  ];

  const socialLinks = [
    { name: 'WhatsApp', handle: '+254 787 251 690', url: 'https://wa.me/254787251690', icon: <FaWhatsapp size={20} />, color: 'hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400' },
    { name: 'Instagram', handle: '@perfectpick.ke', url: 'https://instagram.com/perfectpick.ke', icon: <FaInstagram size={20} />, color: 'hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400' },
    { name: 'TikTok', handle: '@perfectpickke', url: 'https://www.tiktok.com/@perfectpickke', icon: <FaTiktok size={20} />, color: 'hover:bg-stone-500/10 hover:text-dark dark:hover:text-stone-100' },
    { name: 'X / Twitter', handle: '@perfectpickke', url: 'https://x.com/perfectpickke', icon: <FaXTwitter size={20} />, color: 'hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400' },
  ];

  return (
    <div className="flex flex-col gap-20 lg:gap-28 pb-20">
      {/* Hero */}
      <section className="relative bg-surface/50 dark:bg-stone-900/50 py-20 md:py-28 overflow-hidden border-b border-border/40 dark:border-stone-800">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20"
          >
            <Sparkles size={14} /> Our Story
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-dark dark:text-stone-100 tracking-tight"
          >
            Defining Elegance <br /> in <span className="text-primary dark:text-amber-300 italic">Nairobi</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-medium dark:text-stone-300 max-w-2xl mx-auto leading-relaxed"
          >
            Perfect Pick was born from a simple belief: everyone deserves a piece of luxury 
            that makes them feel extraordinary. Since 2018, we've curated the finest 
            accessories, knitwear, and lifestyle picks for the modern style enthusiast in Kenya.
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 dark:bg-amber-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </section>

      {/* Philosophy */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100 leading-tight">
                Authenticity, Style &amp; <br />Uncompromising Quality.
              </h2>
              <p className="text-medium dark:text-stone-300 text-base leading-relaxed">
                At Perfect Pick, we don't just sell products; we curate experiences. 
                Every bag, shoe, jewelry piece, and accessory is carefully hand-selected and verified 
                for genuine quality and timeless Nairobi chic.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 p-5 rounded-2xl bg-surface/40 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <div className="w-10 h-10 bg-primary/10 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-primary dark:text-amber-300">
                  <ShieldCheck size={22} />
                </div>
                <h4 className="font-serif font-bold text-dark dark:text-stone-100 text-base">Genuine Only</h4>
                <p className="text-xs text-muted-foreground dark:text-stone-400">Authentic luxury accessories guaranteed.</p>
              </div>
              <div className="space-y-2 p-5 rounded-2xl bg-surface/40 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <div className="w-10 h-10 bg-primary/10 dark:bg-amber-950/60 rounded-xl flex items-center justify-center text-primary dark:text-amber-300">
                  <Heart size={22} />
                </div>
                <h4 className="font-serif font-bold text-dark dark:text-stone-100 text-base">Passion Driven</h4>
                <p className="text-xs text-muted-foreground dark:text-stone-400">Curated with love for Nairobi fashion.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-surface dark:bg-stone-900 rounded-[3rem] overflow-hidden flex items-center justify-center border border-stone-200/70 dark:border-stone-800 shadow-xl">
              <div className="text-7xl sm:text-8xl text-primary dark:text-amber-300 opacity-90"><FaCrown /></div>
            </div>
            {/* Quote Card */}
            <Card className="absolute -bottom-6 -left-4 sm:-left-8 border border-stone-200/70 dark:border-stone-800 shadow-2xl bg-card text-card-foreground rounded-3xl p-6 sm:p-7 max-w-xs rotate-[-2deg]">
              <CardContent className="p-0 space-y-3">
                <p className="font-serif italic text-dark dark:text-stone-100 text-sm sm:text-base leading-relaxed">
                  "Fashion is the armor to survive the reality of everyday life."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-1 bg-primary rounded-full" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-primary dark:text-amber-300">Perfect Pick Nairobi</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Social Connect Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-[2.5rem] p-8 sm:p-12 border border-stone-800 shadow-2xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-100">Connect With Us</h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Follow our socials for daily fashion drops, styling reels, and fast WhatsApp order support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200">{s.name}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <section className="container mx-auto px-4 sm:px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {contactInfos.map((info, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] h-full rounded-3xl bg-card text-card-foreground">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-surface dark:bg-stone-800 rounded-2xl flex items-center justify-center shadow-xs border border-stone-200/50 dark:border-stone-700">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-dark dark:text-stone-100">{info.title}</h3>
                    {info.link ? (
                      <a href={info.link} className="text-xs text-primary dark:text-amber-300 hover:underline mt-1 inline-block font-medium">
                        {info.detail}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground dark:text-stone-400 mt-1 leading-relaxed whitespace-pre-line">
                        {info.detail}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Policies Link Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-surface/50 dark:bg-stone-900/50 rounded-[3rem] p-8 md:p-14 text-center space-y-6 border border-stone-200/70 dark:border-stone-800">
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Your Confidence, Our Promise.</h2>
          <p className="text-medium dark:text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We believe in transparency and providing you with the finest shopping experience in Kenya. 
            Review our policies or chat with our team on WhatsApp for any inquiries.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link to="/shipping" className="w-full sm:w-auto">
              <Button className="btn-primary w-full sm:w-auto h-12 px-7 rounded-2xl text-sm font-bold gap-2">
                <Truck size={18} /> Shipping Policy
              </Button>
            </Link>
            <Link to="/refund" className="w-full sm:w-auto">
              <Button variant="outline" className="border-stone-300 dark:border-stone-700 text-dark dark:text-stone-200 hover:bg-surface dark:hover:bg-stone-800 w-full sm:w-auto h-12 px-7 rounded-2xl text-sm font-bold gap-2">
                <RotateCcw size={18} /> Refund &amp; Returns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
