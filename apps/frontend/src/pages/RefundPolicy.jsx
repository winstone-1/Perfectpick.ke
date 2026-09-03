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
  Wallet
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
    <div className="min-h-screen bg-bg pb-24">
      {/* Hero Section */}
      <section className="bg-surface py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link to="/home">
              <Button variant="ghost" className="mb-8 text-medium hover:text-primary gap-2">
                <ArrowLeft size={18} /> Back to Home
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            >
              <RotateCcw size={14} /> Returns & Refunds
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-black text-dark"
            >
              Refund <span className="text-primary italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-medium leading-relaxed"
            >
              Your satisfaction is our priority. If you're not completely happy with your 
              purchase, we're here to help with easy returns and exchanges.
            </motion.p>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Returns Window */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-card">

              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Returns Window</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-center">
                  <p className="text-4xl font-serif font-black text-primary mb-2">7 Days</p>
                  <p className="text-medium font-bold uppercase tracking-widest text-xs">Returns & Exchanges</p>
                </div>
                <p className="text-medium leading-relaxed">
                  Items can be returned or exchanged within <span className="font-bold text-dark">7 days</span> of delivery. 
                  The item must be <span className="font-bold text-dark">unused, unworn</span>, and in its original packaging with all tags intact.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Eligibility */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-card">

              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Eligibility Criteria</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Eligible for Return</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-medium">
                      <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                      Wrong item delivered
                    </li>
                    <li className="flex items-center gap-3 text-medium">
                      <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                      Item arrived damaged or defective
                    </li>
                    <li className="flex items-center gap-3 text-medium">
                      <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                      Item significantly different from description
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-border/30 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-red-600">Not Eligible</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-medium">
                      <XCircle className="text-red-500 shrink-0" size={18} />
                      Items worn, washed, or altered
                    </li>
                    <li className="flex items-center gap-3 text-medium">
                      <XCircle className="text-red-500 shrink-0" size={18} />
                      Jewelry & Accessories (hygiene reasons)
                    </li>
                    <li className="flex items-center gap-3 text-medium">
                      <XCircle className="text-red-500 shrink-0" size={18} />
                      Sale/Discounted items (Final Sale)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exchange Process */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-card">

              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <RotateCcw size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Exchange Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="relative space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-primary/20">
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">1</div>
                    <p className="text-medium">Contact us via <span className="font-bold text-dark">WhatsApp or Email</span> within 7 days.</p>
                  </div>
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">2</div>
                    <p className="text-medium">Include your <span className="font-bold text-dark">Order Number</span> and clear photos of the item.</p>
                  </div>
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">3</div>
                    <p className="text-medium">Our team will arrange <span className="font-bold text-dark">collection and dispatch</span> of the replacement.</p>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-2xl flex items-center gap-3 mt-4">
                  <AlertCircle size={18} className="text-primary shrink-0" />
                  <p className="text-xs text-medium">Exchanges are subject to stock availability.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Process */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-card">

              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <Wallet size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Refund Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Processing Time</span>
                    <span className="font-bold text-dark">5-7 Business Days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Refund Method</span>
                    <span className="font-bold text-dark">M-Pesa</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium text-sm">Refunds are issued to the <span className="font-bold text-dark">M-Pesa number</span> used during purchase.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium text-sm">Original <span className="font-bold text-dark">delivery fees</span> are non-refundable.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-footer-bg text-white">

              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-3xl font-serif font-bold">Need help with a return?</h3>
                    <p className="text-footer-text/70">Reach out to our customer care team anytime.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="bg-primary hover:bg-primary-hover text-white rounded-2xl px-8 h-14 font-bold gap-3">
                      <a href="https://wa.me/254700000000">
                        <Phone size={20} /> WhatsApp Support
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-8 h-14 font-bold gap-3">
                      <a href="mailto:perfectpicknairobi@gmail.com">
                        <Mail size={20} /> Email Support
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
