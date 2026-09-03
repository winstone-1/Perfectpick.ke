import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ChevronLeft, 
  ExternalLink, 
  Clock, 
  Mail, 
  User,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order #${orderId.slice(-6).toUpperCase()} updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
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

  const PriceDisplay = (price) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="space-y-1">
        <h1 className="text-4xl font-serif font-black text-dark">Manage Orders</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total: {orders.length} Orders</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-border/10 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Order Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-surface rounded-full">
                        #{order._id.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                          <User size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-dark truncate">{order.shippingAddress.fullName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold truncate">{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                          <Mail size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-dark truncate">{order.user?.email || 'Guest User'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Customer Contact</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Status */}
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 pl-0 lg:pl-12 lg:border-l border-border/10">
                    <div className="text-center md:text-right space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Amount Paid</p>
                      <p className="text-2xl font-serif font-black text-primary">{PriceDisplay(order.totalAmount)}</p>
                    </div>

                    <div className="space-y-4 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        {updatingId === order._id ? (
                          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase animate-pulse">
                            <Loader2 className="animate-spin" size={14} /> Updating...
                          </div>
                        ) : (
                          <Badge className={cn("px-4 py-1 rounded-full border shadow-sm font-bold uppercase text-[10px] tracking-widest", getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                        )}
                      </div>
                      <Select 
                        disabled={updatingId === order._id}
                        defaultValue={order.status} 
                        onValueChange={(val) => handleStatusChange(order._id, val)}
                      >
                        <SelectTrigger className="w-full md:w-[180px] h-11 rounded-xl bg-surface border-transparent focus:ring-primary font-bold text-xs uppercase tracking-widest">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Link to={`/admin/orders/${order._id}`} className="hidden md:block">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-surface text-muted-foreground hover:text-primary transition-all">
                        <ExternalLink size={20} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 italic">
            <ShoppingBag size={64} className="mb-4" />
            <p>No orders have been placed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
