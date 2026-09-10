import React from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const RefundPolicy = () => {
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
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
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
              <RotateCcw size={14} /> Returns &amp; Exchanges
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-black text-dark dark:text-stone-100"
            >
              Refund <span className="text-primary dark:text-amber-300 italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base md:text-lg text-medium dark:text-stone-300 leading-relaxed max-w-2xl mx-auto"
            >
              Your satisfaction is our priority. If you're not completely happy with your 
              purchase, we're here to help with smooth returns and exchanges across Kenya.
            </motion.p>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 dark:bg-amber-400/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </section>

      <div className="container mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Returns Window */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <Clock size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Returns Window</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="bg-primary/5 dark:bg-amber-950/40 p-6 rounded-2xl border border-primary/10 text-center">
                  <p className="text-4xl font-serif font-black text-primary dark:text-amber-300 mb-1">7 Days</p>
                  <p className="text-medium dark:text-stone-300 font-bold uppercase tracking-widest text-[11px]">Exchange &amp; Return Window</p>
                </div>
                <p className="text-xs sm:text-sm text-medium dark:text-stone-300 leading-relaxed">
                  Items can be returned or exchanged within <span className="font-bold text-dark dark:text-stone-100">7 days</span> of delivery. 
                  The item must be <span className="font-bold text-dark dark:text-stone-100">unused, unworn</span>, and in its original packaging with all tags intact.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Eligibility */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Eligibility Criteria</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-amber-300">Eligible for Exchange / Return</h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={16} />
                      Wrong item or incorrect size delivered
                    </li>
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={16} />
                      Item arrived damaged or with a verified defect
                    </li>
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={16} />
                      Item significantly differs from description
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-border/40 dark:border-stone-800 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Non-Returnable Items</h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <XCircle className="text-rose-500 shrink-0" size={16} />
                      Items worn, washed, or altered
                    </li>
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <XCircle className="text-rose-500 shrink-0" size={16} />
                      Earrings and hygiene-sensitive accessories
                    </li>
                    <li className="flex items-center gap-2.5 text-medium dark:text-stone-300">
                      <XCircle className="text-rose-500 shrink-0" size={16} />
                      Clearance flash sale items marked Final Sale
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exchange Process */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <RotateCcw size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Exchange Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="relative space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-primary/20">
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-primary text-white dark:text-stone-950 text-[10px] font-bold flex items-center justify-center">1</div>
                    <p className="text-xs sm:text-sm text-medium dark:text-stone-300">Contact us via <span className="font-bold text-dark dark:text-stone-100">WhatsApp or Email</span> within 7 days.</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-primary text-white dark:text-stone-950 text-[10px] font-bold flex items-center justify-center">2</div>
                    <p className="text-xs sm:text-sm text-medium dark:text-stone-300">Share your <span className="font-bold text-dark dark:text-stone-100">Order Number</span> and clear photos of the item.</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-primary text-white dark:text-stone-950 text-[10px] font-bold flex items-center justify-center">3</div>
                    <p className="text-xs sm:text-sm text-medium dark:text-stone-300">Our concierge team will arrange <span className="font-bold text-dark dark:text-stone-100">collection &amp; replacement</span>.</p>
                  </div>
                </div>
                <div className="bg-surface/60 dark:bg-stone-800 p-3.5 rounded-2xl flex items-center gap-2.5 mt-4 border border-stone-200/50 dark:border-stone-700">
                  <AlertCircle size={16} className="text-primary dark:text-amber-300 shrink-0" />
                  <p className="text-xs text-medium dark:text-stone-300">Exchanges are subject to current inventory availability.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Process */}
          <motion.div variants={itemVariants}>
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden h-full bg-card text-card-foreground">
              <CardHeader className="bg-surface/50 dark:bg-stone-900/60 border-b border-border/40 dark:border-stone-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white dark:text-stone-950 rounded-xl flex items-center justify-center font-bold">
                    <Wallet size={20} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif font-black text-dark dark:text-stone-100">Refund Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Processing Time</span>
                    <span className="font-bold text-dark dark:text-stone-100">3-5 Business Days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 dark:border-stone-800 pb-3">
                    <span className="text-medium dark:text-stone-300">Refund Channel</span>
                    <span className="font-bold text-dark dark:text-stone-100">M-Pesa / Original Method</span>
                  </div>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm">
                  <li className="flex gap-2.5 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300">Refunds are issued directly to the <span className="font-bold text-dark dark:text-stone-100">M-Pesa number</span> used during payment.</p>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium dark:text-stone-300">Original courier shipping costs are non-refundable.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="border border-stone-800 shadow-2xl rounded-3xl overflow-hidden bg-stone-900 dark:bg-stone-950 text-stone-100">
              <CardContent className="p-6 sm:p-10">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-100">Need Help with a Return?</h3>
                    <p className="text-xs sm:text-sm text-stone-400">Our customer care team is available to assist you Monday through Saturday.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto">
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-6 h-12 font-bold gap-2 text-xs uppercase tracking-wider cursor-pointer shadow-md">
                      <a href="https://wa.me/254787251690" target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={18} /> WhatsApp Support
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="border-stone-700 text-stone-200 hover:bg-stone-800 rounded-2xl px-6 h-12 font-bold gap-2 text-xs uppercase tracking-wider cursor-pointer">
                      <a href="mailto:perfectpick26@gmail.com">
                        <Mail size={18} /> Email Support
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
