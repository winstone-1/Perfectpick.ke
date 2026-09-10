import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  Phone, 
  Info,
  PackageCheck,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ShippingPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-surface/50 dark:bg-stone-900/50 py-16 md:py-24 relative overflow-hidden border-b border-border/40 dark:border-stone-800">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Link to="/">
              <Button variant="ghost" className="mb-6 text-muted-foreground dark:text-stone-400 hover:text-primary dark:hover:text-amber-300 gap-2 text-xs uppercase font-bold tracking-wider">
                <ArrowLeft size={16} /> Back to Home
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20"
            >
              <Truck size={14} /> Logistics &amp; Delivery
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-black text-dark dark:text-stone-100"
            >
              Shipping <span className="text-primary dark:text-amber-300 italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base md:text-lg text-medium dark:text-stone-300 leading-relaxed max-w-2xl mx-auto"
            >
              Fast, reliable, and secure delivery to your doorstep across Kenya. 
              We ensure your luxury picks reach you in perfect condition.
            </motion.p>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Delivery Zones & Timeframes */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <MapPin size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Delivery Zones &amp; Timeframes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-border/40 dark:border-stone-800 pb-4">
                    <div>
                      <h4 className="font-bold text-dark dark:text-stone-100 text-sm">Nairobi CBD &amp; Westlands</h4>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">Order before 12PM for priority same-day dispatch</p>
                    </div>
                    <span className="text-primary dark:text-amber-300 font-bold text-xs bg-primary/10 dark:bg-amber-950/60 px-3 py-1 rounded-full whitespace-nowrap">Same Day</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/40 dark:border-stone-800 pb-4">
                    <div>
                      <h4 className="font-bold text-dark dark:text-stone-100 text-sm">Nairobi Estates</h4>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">Kilimani, Karen, Langata, Kasarani, Lavington, etc.</p>
                    </div>
                    <span className="text-primary dark:text-amber-300 font-bold text-xs bg-primary/10 dark:bg-amber-950/60 px-3 py-1 rounded-full whitespace-nowrap">1-2 Days</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/40 dark:border-stone-800 pb-4">
                    <div>
                      <h4 className="font-bold text-dark dark:text-stone-100 text-sm">Greater Nairobi</h4>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">Kiambu, Ruiru, Machakos, Thika</p>
                    </div>
                    <span className="text-primary dark:text-amber-300 font-bold text-xs bg-primary/10 dark:bg-amber-950/60 px-3 py-1 rounded-full whitespace-nowrap">2-3 Days</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-dark dark:text-stone-100 text-sm">Rest of Kenya</h4>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">Doorstep or parcel courier delivery</p>
                    </div>
                    <span className="text-primary dark:text-amber-300 font-bold text-xs bg-primary/10 dark:bg-amber-950/60 px-3 py-1 rounded-full whitespace-nowrap">2-4 Days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delivery Costs */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <PackageCheck size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Delivery Rates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Nairobi CBD</span>
                    <span className="font-bold text-dark dark:text-stone-100">KES 200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Nairobi Estates</span>
                    <span className="font-bold text-dark dark:text-stone-100">KES 300</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Greater Nairobi</span>
                    <span className="font-bold text-dark dark:text-stone-100">KES 500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Rest of Kenya</span>
                    <span className="font-bold text-dark dark:text-stone-100">KES 600 - 800</span>
                  </div>
                  <div className="bg-primary/5 dark:bg-amber-950/40 p-4 rounded-2xl flex items-center justify-between border border-primary/20">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="text-primary dark:text-amber-300" size={20} />
                      <span className="font-serif font-bold text-dark dark:text-stone-100 text-xs sm:text-sm">Standard Orders in Nairobi</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">FREE</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Processing */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <Clock size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Order Processing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300 leading-relaxed">Orders placed <span className="font-bold text-dark dark:text-stone-100">before 12PM</span> are packaged and dispatched same day.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300 leading-relaxed">Orders after 12PM are processed the <span className="font-bold text-dark dark:text-stone-100">next business morning</span>.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300 leading-relaxed">You will receive instant SMS/WhatsApp confirmation once dispatched.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300 leading-relaxed">Operating days are <span className="font-bold text-dark dark:text-stone-100">Monday–Saturday</span>.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <Info size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Tracking &amp; Direct Inquiries</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <p className="text-xs sm:text-sm text-medium dark:text-stone-300 leading-relaxed">
                  Stay updated on your parcel. Our concierge team is on standby via WhatsApp and Email.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <a href="mailto:perfectpick26@gmail.com" className="flex items-center gap-3 p-3.5 bg-surface dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-700 hover:border-primary/40 transition-colors group">
                    <Mail className="text-primary dark:text-amber-300 group-hover:scale-110 transition-transform shrink-0" size={18} />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 uppercase font-black">Email Us</p>
                      <p className="text-xs font-bold text-dark dark:text-stone-100 truncate">perfectpick26@gmail.com</p>
                    </div>
                  </a>
                  <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 bg-surface dark:bg-stone-800 rounded-2xl border border-stone-200/50 dark:border-stone-700 hover:border-primary/40 transition-colors group">
                    <MessageCircle className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 uppercase font-black">WhatsApp</p>
                      <p className="text-xs font-bold text-dark dark:text-stone-100">+254 787 251 690</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

