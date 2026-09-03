import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-emerald-100 text-emerald-800',
  cancelled:  'bg-red-100 text-red-800',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-surface rounded-full flex items-center justify-center text-primary"
        >
          <Package size={64} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark">No orders yet</h1>
          <p className="text-muted-foreground max-w-xs">
            You haven't placed any orders yet. Start shopping!
          </p>
        </div>
        <Button className="btn-primary h-12 px-10 rounded-full" onClick={() => navigate('/products')}>
          Explore Our Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 max-w-4xl">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-primary" size={28} />
          <h1 className="text-3xl font-serif font-black text-dark">My Orders</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Order
                        </span>
                        <span className="font-mono font-black text-dark text-sm">
                          #{order._id?.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {order.status}
                        </span>
                        {order.isPaid && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Paid
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Total + Action */}
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-primary">{formatPrice(order.totalPrice)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        <ChevronRight size={20} />
                      </Button>
                    </div>
                  </div>

                  {/* Item previews */}
                  {order.items?.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg bg-surface overflow-hidden flex-shrink-0"
                        >
                          {item.product?.images?.[0] || item.product?.image ? (
                            <img
                              src={item.product.images?.[0] || item.product.image}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={16} className="text-muted-foreground opacity-30" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-muted-foreground">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;