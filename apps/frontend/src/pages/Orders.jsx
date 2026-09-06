import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Package, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const statusColors = {
  pending:    'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/40',
  processing: 'bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300/40',
  shipped:    'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300/40',
  delivered:  'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/40',
  cancelled:  'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300/40',
};

const Orders = () => {
  const { t } = useTranslation();
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
      <div className="container mx-auto px-4 py-28 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-surface dark:bg-stone-800 rounded-full flex items-center justify-center text-primary shadow-inner"
        >
          <Package size={52} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">{t('orders.noOrders')}</h1>
          <p className="text-muted-foreground dark:text-stone-400 text-sm max-w-sm mx-auto">
            {t('orders.noOrdersDesc')}
          </p>
        </div>
        <Button className="btn-primary h-12 px-8 rounded-full shadow-md" onClick={() => navigate('/products')}>
          {t('orders.exploreCollection')}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16 max-w-4xl space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-border/40 dark:border-stone-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">{t('orders.title')}</h1>
          <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest mt-1">
            {t('orders.trackView')}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs font-bold text-dark dark:text-stone-200">
          <ShoppingBag size={14} className="text-primary" />
          <span>{t('orders.orderCount', { count: orders.length, defaultValue: `${orders.length} Orders` })}</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-card text-card-foreground">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-muted-foreground dark:text-stone-400 uppercase tracking-widest">
                        {t('orders.order')}
                      </span>
                      <span className="font-mono font-black text-dark dark:text-stone-100 text-sm">
                        #{order._id?.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${statusColors[order.status?.toLowerCase()] || 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300/40'}`}
                      >
                        {order.status}
                      </span>
                      {order.isPaid && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40">
                          {t('orders.paid')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-stone-400 font-medium">{t('orders.placedOn', { date: formatDate(order.createdAt) })}</p>
                    <p className="text-xs text-medium dark:text-stone-300 font-medium">
                      {t('orders.items', { count: order.items?.length, defaultValue: `${order.items?.length} items` })}
                    </p>
                  </div>

                  {/* Total + Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground dark:text-stone-400 tracking-wider">{t('orders.total')}</p>
                      <span className="text-lg font-black text-primary dark:text-amber-300">{formatPrice(order.totalPrice ?? order.totalAmount)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-stone-200 dark:border-stone-700 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-stone-900 transition-colors cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <span>{t('orders.view')}</span>
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Item previews */}
                {order.items?.length > 0 && (
                  <div className="flex gap-2.5 mt-5 pt-4 border-t border-border/40 dark:border-stone-800 flex-wrap">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl bg-surface dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-200/50 dark:border-stone-700"
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
                            <ShoppingBag size={16} className="text-muted-foreground dark:text-stone-500 opacity-40" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-xl bg-surface dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-muted-foreground dark:text-stone-400 border border-stone-200/50 dark:border-stone-700">
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
  );
};

export default Orders;
