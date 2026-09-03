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
    { label: 'Total Orders', value: stats?.totalOrders, icon: <ShoppingBag />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: stats?.totalUsers, icon: <Users />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Revenue', value: stats ? formatPrice(stats.totalRevenue) : null, icon: <Banknote />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: <Clock />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-black text-dark">Admin Dashboard</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Perfect Pick Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
          statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className={cn("text-2xl font-black font-serif", stat.color)}>{stat.value}</p>
                  </div>
                  <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                    {React.cloneElement(stat.icon, { size: 24 })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <Link to="/admin/products" className="group">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white hover:bg-surface transition-all duration-300 overflow-hidden">
            <CardContent className="p-10 flex flex-col justify-between h-full space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-5 bg-primary/10 text-primary rounded-[2rem]">
                  <PackageSearch size={32} />
                </div>
                <div className="h-10 w-10 rounded-full border border-border/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-black text-dark">Manage Products</h2>
                <p className="text-medium leading-relaxed">Add new pieces to the collection, update stock levels, and manage variants.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/orders" className="group">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-dark text-white hover:bg-dark/95 transition-all duration-300 overflow-hidden">
            <CardContent className="p-10 flex flex-col justify-between h-full space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-5 bg-white/10 text-primary rounded-[2rem]">
                  <ClipboardList size={32} />
                </div>
                <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-black text-white">Manage Orders</h2>
                <p className="text-white/60 leading-relaxed">Track order statuses, confirm payments, and manage fulfillment.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
