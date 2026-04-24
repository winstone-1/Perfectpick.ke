import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { FaCrown } from 'react-icons/fa6';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Truck, RotateCcw } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const contactInfos = [
    { icon: <MapPin />, title: 'Visit Us', detail: 'Nairobi Commercial Center, Floor 2, Nairobi, Kenya' },
    { icon: <Phone />, title: 'Call Us', detail: '+254 787 251 690' },
    { icon: <Mail />, title: 'Email Us', detail: 'hello@perfectpick.co.ke' },
    { icon: <Clock />, title: 'Working Hours', detail: 'Mon - Sat: 8:30 AM - 7:30 PM | Sun & Holidays: 10:30 AM - 6:00 PM' }
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero */}
      <section className="relative bg-surface py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
          >
            <Sparkles size={14} /> Our Story
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-black text-dark"
          >
            Defining Elegance <br /> in <span className="text-primary italic">Nairobi</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-medium max-w-2xl mx-auto leading-relaxed"
          >
            Perfect Pick was born from a simple belief: everyone deserves a piece of luxury 
            that makes them feel extraordinary. Since 2018, we've curated the finest 
            accessories for the modern Kenyan style enthusiast.
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Philosophy */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-black text-dark leading-tight">Authenticity, Style & <br />Quality.</h2>
              <p className="text-medium text-lg leading-relaxed">
                At Perfect Pick, we don't just sell products; we curate experiences. 
                Every bag, shoe, and jewelry piece is hand-selected and verified 
                for genuine quality and timeless style.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-serif font-bold text-dark text-lg">Genuine Only</h4>
                <p className="text-sm text-muted-foreground">Original luxury pieces guaranteed.</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-primary">
                  <Heart size={24} />
                </div>
                <h4 className="font-serif font-bold text-dark text-lg">Passion Driven</h4>
                <p className="text-sm text-muted-foreground">We love what we do, and it shows.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-surface rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl skew-y-1">
              <div className="text-8xl text-primary"><FaCrown /></div>
            </div>
            {/* Quote Card */}
            <Card className="absolute -bottom-8 -left-8 md:-left-12 border-none shadow-2xl bg-white rounded-3xl p-8 max-w-xs rotate-[-2deg]">
              <CardContent className="p-0 space-y-4">
                <p className="font-serif italic text-dark text-lg leading-relaxed">
                  "Fashion is the armor to survive the reality of everyday life."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-primary rounded-full" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#c08050]">The Founder</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Info Grid */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {contactInfos.map((info, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-none shadow-sm h-full rounded-3xl bg-surface/30 hover:bg-surface transition-colors cursor-default">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-dark">{info.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{info.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* Policies Link Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-surface rounded-[3rem] p-8 md:p-16 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-dark">Your Confidence, Our Promise.</h2>
          <p className="text-medium text-lg max-w-2xl mx-auto">
            We believe in transparency and providing you with the best shopping experience. 
            Review our policies to understand how we serve you better.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shipping">
              <Button className="btn-primary w-full sm:w-auto h-14 px-8 rounded-2xl text-lg gap-2">
                <Truck size={20} /> Shipping Policy
              </Button>
            </Link>
            <Link to="/refund">
              <Button variant="outline" className="btn-outline w-full sm:w-auto h-14 px-8 rounded-2xl text-lg gap-2">
                <RotateCcw size={20} /> Refund & Returns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
