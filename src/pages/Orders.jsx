import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-black text-dark">My Orders</h1>
        <Badge variant="outline" className="rounded-full px-4 h-8 bg-white border-border/10 font-bold">
          {orders.length} TOTAL
        </Badge>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6 max-w-4xl">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/orders/${order._id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-white">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6 items-center">
                      <div className="h-16 w-16 bg-surface rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Package size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-muted-foreground uppercase">Order #{order._id.slice(-8)}</div>
                        <h3 className="font-serif font-bold text-lg text-dark">
                          {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><CreditCard size={14} /> {formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <Badge className={cn("px-4 py-1 rounded-full border shadow-sm font-bold uppercase text-[10px] tracking-widest", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                      <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
          <ShoppingBag size={80} className="text-medium" />
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-dark">No orders yet</h3>
            <p className="max-w-xs">Once you place your first order at Perfect Pick, it will appear here.</p>
          </div>
          <Link to="/products">
            <Button className="btn-primary rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
