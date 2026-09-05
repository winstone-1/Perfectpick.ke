import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  ShoppingBag,
  MessageCircle
} from 'lucide-react';
import api from '../api/axios';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        // backend returns {success:true, data: order} (orderController) — support both shapes
        const fetched = data.data || data.order;
        setOrder(fetched);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const steps = [
    { label: 'Pending', icon: <Clock size={16} />, status: 'pending' },
    { label: 'Processing', icon: <Package size={16} />, status: 'processing' },
    { label: 'Shipped', icon: <Truck size={16} />, status: 'shipped' },
    { label: 'Delivered', icon: <CheckCircle2 size={16} />, status: 'delivered' }
  ];

  const currentStepIndex = order ? steps.findIndex(s => s.status === order.status?.toLowerCase()) : 0;
  const isCancelled = order?.status?.toLowerCase() === 'cancelled';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const openWhatsApp = () => {
    const orderId = order?._id?.slice(-6).toUpperCase() || id;
    const text = encodeURIComponent(`Hello PerfectPick! I am inquiring about my Order #${orderId}.`);
    window.open(`https://wa.me/254787251690?text=${text}`, '_blank');
  };

  if (loading) return <div className="container mx-auto px-4 py-20"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center text-dark dark:text-stone-100">Order not found</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10">
      <Link 
        to="/orders" 
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground dark:text-stone-400 hover:text-primary transition-colors group uppercase tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40 dark:border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-serif font-black text-dark dark:text-stone-100">Order Details</h1>
            <Badge className={cn(
              "rounded-full px-3.5 py-1 border shadow-xs font-bold uppercase text-[10px] tracking-widest",
              isCancelled 
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900" 
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
            )}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground dark:text-stone-400 font-mono text-xs uppercase tracking-wider">
            Order #{order._id?.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground dark:text-stone-400 text-xs font-medium">
          <Calendar size={16} className="text-primary" />
          <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
        {/* Progress & Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Tracker */}
          {!isCancelled && (
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-stone-200 dark:bg-stone-800 z-0" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                    className="absolute top-5 left-0 h-0.5 bg-primary z-0"
                  />
                  
                  {steps.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                        <motion.div 
                          animate={{ scale: isCurrent ? 1.15 : 1 }}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 shadow-xs",
                            isActive 
                              ? "bg-primary border-primary text-white dark:text-stone-900" 
                              : "bg-surface dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-muted-foreground dark:text-stone-400"
                          )}
                        >
                          {step.icon}
                        </motion.div>
                        <span className={cn(
                          "text-[10px] uppercase font-black tracking-wider text-center",
                          isActive ? "text-dark dark:text-stone-100" : "text-muted-foreground dark:text-stone-500"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
            <div className="bg-surface/50 dark:bg-stone-900/60 px-6 sm:px-8 py-5 border-b border-border/40 dark:border-stone-800 flex items-center gap-3">
              <ShoppingBag className="text-primary" size={20} />
              <h2 className="font-serif font-black text-lg text-dark dark:text-stone-100">Order Items</h2>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {order.items?.map((item, i) => {
                const prod = item.product || item.productId;
                const img = prod?.images?.[0] || prod?.image;
                const name = prod?.name || 'Product';
                return (
                <div key={i} className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between group">
                  <div className="flex gap-4 sm:gap-5 items-center">
                    <div className="h-20 w-20 bg-surface dark:bg-stone-800 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-stone-200/50 dark:border-stone-700">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Package size={28} className="text-medium dark:text-stone-400 opacity-30" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-dark dark:text-stone-100">{name}</h4>
                      <p className="text-[11px] font-black uppercase tracking-widest text-primary">{item.variant || 'Standard'}</p>
                      <p className="text-xs text-muted-foreground dark:text-stone-400">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-primary dark:text-amber-300">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
                );
              })}
              
              <Separator className="bg-border/40 dark:bg-stone-800" />
              
              <div className="flex justify-end pt-2">
                <div className="space-y-2.5 w-full max-w-xs text-sm">
                  <div className="flex justify-between text-medium dark:text-stone-300">
                    <span>Subtotal</span>
                    <span className="font-bold text-dark dark:text-stone-100">{formatPrice(order.totalPrice ?? order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-medium dark:text-stone-300">
                    <span>Delivery</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[11px] tracking-wider">Free (Nairobi)</span>
                  </div>
                  <Separator className="bg-border/40 dark:bg-stone-800" />
                  <div className="flex justify-between items-center text-xl font-black text-dark dark:text-stone-100 pt-1">
                    <span>Total</span>
                    <span className="text-primary dark:text-amber-300">{formatPrice(order.totalPrice ?? order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
            <div className="bg-surface/50 dark:bg-stone-900/60 px-6 py-4 border-b border-border/40 dark:border-stone-800 flex items-center gap-2.5">
              <MapPin className="text-primary" size={18} />
              <h3 className="font-serif font-bold text-dark dark:text-stone-100">Shipping Address</h3>
            </div>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="space-y-0.5">
                <p className="font-bold text-dark dark:text-stone-100">{order.shippingAddress?.fullName}</p>
                <p className="text-muted-foreground dark:text-stone-400">{order.shippingAddress?.phone}</p>
              </div>
              <p className="text-muted-foreground dark:text-stone-300 leading-relaxed">
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, Kenya
              </p>
            </CardContent>
          </Card>

          {/* Secure Note & Support */}
          <div className="bg-stone-900 dark:bg-stone-950 rounded-3xl p-6 text-stone-100 space-y-4 border border-stone-800 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldCheck size={22} />
              <h3 className="font-serif font-bold text-base text-stone-100">Authenticity Guarantee</h3>
            </div>
            <p className="text-xs text-stone-300 dark:text-stone-400 leading-relaxed">
              Every Perfect Pick purchase is backed by our customer satisfaction promise. Need assistance with this order?
            </p>
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl h-12 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
