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
  Clock 
} from 'lucide-react';
import api from '../api/axios';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
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

  const currentStepIndex = order ? steps.findIndex(s => s.status === order.status.toLowerCase()) : 0;
  const isCancelled = order?.status.toLowerCase() === 'cancelled';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <div className="container mx-auto px-4 py-20"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center">Order not found</div>;

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <Link 
        to="/orders" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-dark">Order Details</h1>
            <Badge className={cn(
              "rounded-full px-4 py-1 border shadow-sm font-bold uppercase text-[10px] tracking-widest",
              isCancelled ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
            )}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase">Order #{order._id.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Calendar size={18} />
          <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Progress & Items */}
        <div className="lg:col-span-2 space-y-12">
          {/* Progress Tracker */}
          {!isCancelled && (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-border/20 z-0" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    className="absolute top-5 left-0 h-0.5 bg-primary z-0"
                  />
                  
                  {steps.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                        <motion.div 
                          animate={{ scale: isCurrent ? 1.2 : 1 }}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500",
                            isActive ? "bg-primary border-primary text-white" : "bg-white border-border/20 text-muted-foreground"
                          )}
                        >
                          {step.icon}
                        </motion.div>
                        <span className={cn(
                          "text-[10px] uppercase font-black tracking-widest",
                          isActive ? "text-dark" : "text-muted-foreground"
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
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <div className="bg-surface px-10 py-6 border-b border-border/10 flex items-center gap-4">
              <ShoppingBag className="text-primary" size={20} />
              <h2 className="font-serif font-black text-xl">Order Items</h2>
            </div>
            <CardContent className="p-8 md:p-10 space-y-8">
              {order.items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between group">
                  <div className="flex gap-6 items-center">
                    <div className="h-24 w-24 bg-surface rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.productId.image ? (
                        <img src={item.productId.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Package size={32} className="text-medium opacity-20" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-lg text-dark">{item.productId.name}</h4>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.variant}</p>
                      <p className="text-sm text-medium">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-dark">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              <Separator className="bg-border/10" />
              
              <div className="flex justify-end pt-4">
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between text-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-medium">
                    <span>Delivery</span>
                    <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-black text-dark pt-4">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <div className="bg-surface px-8 py-5 border-b border-border/10 flex items-center gap-3">
              <MapPin className="text-primary" size={18} />
              <h3 className="font-serif font-bold">Shipping Address</h3>
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-1">
                <p className="font-bold text-dark text-lg">{order.shippingAddress.fullName}</p>
                <p className="text-medium">{order.shippingAddress.phone}</p>
              </div>
              <p className="text-medium leading-relaxed">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, Kenya
              </p>
            </CardContent>
          </Card>

          {/* Secure Note */}
          <div className="bg-dark rounded-[2.5rem] p-8 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck size={24} />
              <h3 className="font-serif font-bold text-lg text-footer-text">Secure Shopping</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Every Perfect Pick purchase is backed by our authenticity guarantee. If you have any issues with your order, please contact our Nairobi boutique.
            </p>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
