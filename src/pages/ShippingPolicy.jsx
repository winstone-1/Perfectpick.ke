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
  PackageCheck
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
    <div className="min-h-screen bg-bg pb-24">
      {/* Hero Section */}
      <section className="bg-surface py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
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
              <Truck size={14} /> Logistics & Delivery
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-black text-dark"
            >
              Shipping <span className="text-primary italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-medium leading-relaxed"
            >
              Fast, reliable, and secure delivery to your doorstep across Kenya. 
              We ensure your luxury picks reach you in perfect condition.
            </motion.p>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Delivery Zones & Timeframes */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-white">
              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <MapPin size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Delivery Zones & Timeframes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-border/30 pb-4">
                    <div>
                      <h4 className="font-bold text-dark">Nairobi CBD & Westlands</h4>
                      <p className="text-sm text-muted-foreground">Order before 12PM for priority service</p>
                    </div>
                    <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">Same Day</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/30 pb-4">
                    <div>
                      <h4 className="font-bold text-dark">Nairobi Estates</h4>
                      <p className="text-sm text-muted-foreground">Kilimani, Karen, Langata, Kasarani, etc.</p>
                    </div>
                    <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">1-2 Days</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border/30 pb-4">
                    <div>
                      <h4 className="font-bold text-dark">Greater Nairobi</h4>
                      <p className="text-sm text-muted-foreground">Kiambu, Machakos, Thika</p>
                    </div>
                    <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">2-3 Days</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-dark">Rest of Kenya</h4>
                      <p className="text-sm text-muted-foreground">Via reliable courier partners</p>
                    </div>
                    <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">3-5 Days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delivery Costs */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-white">
              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <PackageCheck size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Delivery Costs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Nairobi CBD</span>
                    <span className="font-bold text-dark">KES 200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Nairobi Estates</span>
                    <span className="font-bold text-dark">KES 300</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Greater Nairobi</span>
                    <span className="font-bold text-dark">KES 500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-4">
                    <span className="text-medium">Rest of Kenya</span>
                    <span className="font-bold text-dark">KES 700</span>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl flex items-center justify-between border border-primary/20">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-primary" size={20} />
                      <span className="font-serif font-bold text-dark">Orders above KES 5,000</span>
                    </div>
                    <span className="text-primary font-black">FREE</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Processing */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-white">
              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Order Processing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium leading-relaxed">Orders placed <span className="font-bold text-dark">before 12PM</span> are processed the same day.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium leading-relaxed">Orders after 12PM are processed the <span className="font-bold text-dark">next business day</span>.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium leading-relaxed">You will receive a confirmation SMS/email once your order is dispatched.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-medium leading-relaxed">Business days are <span className="font-bold text-dark">Monday–Saturday</span>, excluding public holidays.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden h-full bg-white">
              <CardHeader className="bg-surface/50 border-b border-border/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                    <Info size={22} />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-dark">Tracking & Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <p className="text-medium leading-relaxed">
                  Stay updated on your order's journey. Once dispatched, you'll receive a tracking update via SMS or WhatsApp.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href="mailto:perfectpicknairobi@gmail.com" className="flex items-center gap-3 p-4 bg-surface rounded-2xl hover:bg-primary/10 transition-colors group">
                    <Mail className="text-primary group-hover:scale-110 transition-transform" size={20} />
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground uppercase font-black">Email Us</p>
                      <p className="text-sm font-bold text-dark truncate">perfectpicknairobi@gmail.com</p>
                    </div>
                  </a>
                  <a href="https://wa.me/254700000000" className="flex items-center gap-3 p-4 bg-surface rounded-2xl hover:bg-primary/10 transition-colors group">
                    <Phone className="text-primary group-hover:scale-110 transition-transform" size={20} />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-black">WhatsApp</p>
                      <p className="text-sm font-bold text-dark">+254 700 000 000</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Notes */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-primary text-white">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                    <Info size={40} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-serif font-bold">Important Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Delivery times may vary slightly during peak seasons (holidays or major sales events).
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Perfect Pick is not responsible for delays caused by incorrect or incomplete addresses.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Please ensure someone is available to receive the delivery at the provided address.
                        </p>
                      </div>
                    </div>
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

export default ShippingPolicy;
