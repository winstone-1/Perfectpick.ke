import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Users, 
  Banknote, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  PackageSearch,
  ClipboardList
} from 'lucide-react';
import api from '../../api/axios';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        // backend returns {success:true, data:{totalProducts,totalOrders,totalUsers,totalRevenue,pendingOrders}}
        const s = data.data || data.stats;
        setStats({
          totalOrders: s.totalOrders ?? 0,
          totalUsers: s.totalUsers ?? 0,
          totalRevenue: s.totalRevenue ?? 0,
          pendingOrders: s.pendingOrders ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          pendingOrders: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders, icon: <ShoppingBag />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Total Users', value: stats?.totalUsers, icon: <Users />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50' },
    { label: 'Total Revenue', value: stats ? formatPrice(stats.totalRevenue) : null, icon: <Banknote />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: <Clock />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10">
      <div className="space-y-1 pb-4 border-b border-border/40 dark:border-stone-800">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Admin Dashboard</h1>
        <p className="text-muted-foreground dark:text-stone-400 uppercase tracking-widest text-[10px] font-black">Perfect Pick Management Console</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
          statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden bg-card text-card-foreground">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground dark:text-stone-400 uppercase tracking-wider">{stat.label}</p>
                    <p className={cn("text-2xl font-black font-serif", stat.color)}>{stat.value}</p>
                  </div>
                  <div className={cn("p-3.5 rounded-2xl", stat.bg, stat.color)}>
                    {React.cloneElement(stat.icon, { size: 22 })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
        <Link to="/admin/products" className="group">
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-xl rounded-[2.5rem] bg-card text-card-foreground hover:border-primary/40 dark:hover:border-amber-400/40 transition-all duration-300 overflow-hidden h-full">
            <CardContent className="p-8 sm:p-10 flex flex-col justify-between h-full space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-primary/10 dark:bg-amber-950/60 text-primary dark:text-amber-300 rounded-2xl">
                  <PackageSearch size={28} />
                </div>
                <div className="h-10 w-10 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-stone-950 transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-dark dark:text-stone-100">Manage Products</h2>
                <p className="text-muted-foreground dark:text-stone-400 text-xs sm:text-sm leading-relaxed">Add new luxury pieces to the catalog, adjust stock levels, upload hero videos, and manage discounts.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/orders" className="group">
          <Card className="border border-stone-800 shadow-xl rounded-[2.5rem] bg-stone-900 dark:bg-stone-950 text-stone-100 hover:bg-stone-850 transition-all duration-300 overflow-hidden h-full">
            <CardContent className="p-8 sm:p-10 flex flex-col justify-between h-full space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-stone-800 text-amber-400 rounded-2xl">
                  <ClipboardList size={28} />
                </div>
                <div className="h-10 w-10 rounded-full border border-stone-700 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-stone-950 transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-100">Manage Orders</h2>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">Track customer orders, update delivery fulfillment stages, verify payments, and inspect recipient details.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
