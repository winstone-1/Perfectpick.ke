import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  ChevronLeft, 
  Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const cartItems = Array.isArray(cart) ? cart : [];
  const hasItems = cartItems.length > 0;

  if (!hasItems && !loading) {
    return (
      <div className="container mx-auto px-4 py-28 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-surface dark:bg-stone-800 rounded-full flex items-center justify-center text-primary"
        >
          <ShoppingBag size={52} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">{t('cart.emptyTitle')}</h1>
          <p className="text-muted-foreground dark:text-stone-400 text-sm max-w-sm mx-auto">
            {t('cart.emptyDesc')}
          </p>
        </div>
        <Link to="/products">
          <Button className="btn-primary h-12 px-8 rounded-full">{t('cart.exploreCollection')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/40 dark:border-stone-800">
            <div>
              <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">{t('cart.shoppingBag')}</h1>
              <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest mt-0.5">
                {t('cart.itemsSelected', { count: cartItems.length, defaultValue: `${cartItems.length} items selected` })}
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {t('cart.continueShopping')}
            </Link>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => {
                const prod = item?.product;
                const img = prod?.images?.[0] || prod?.image;
                const name = prod?.name || 'Product';
                const price = prod?.price || 0;
                const itemTotal = price * (item?.quantity || 1);

                return (
                  <motion.div
                    key={item?._id || `${prod?._id}-${item?.variant}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_16px_rgba(61,39,26,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden bg-card">
                      <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                        {/* Image */}
                        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-surface dark:bg-stone-800 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-stone-200/50 dark:border-stone-700">
                          {img ? (
                            <img 
                              src={img} 
                              alt={name} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <ShoppingBag size={28} className="text-medium opacity-20" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-serif font-bold text-base sm:text-lg text-dark dark:text-stone-100 truncate">{name}</h3>
                              <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-0.5">
                                {item?.variant || t('cart.standard')}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 -mt-1 -mr-1"
                              onClick={() => item?._id && removeFromCart(item._id)}
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            {/* Stepper */}
                            <div className="flex items-center border border-stone-200/80 dark:border-stone-700 rounded-xl p-0.5 bg-surface/50 dark:bg-stone-800">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-medium dark:text-stone-300"
                                onClick={() => item?._id && updateQuantity(item._id, (item?.quantity || 1) - 1)}
                                disabled={(item?.quantity || 1) <= 1}
                              >
                                <Minus size={12} />
                              </Button>
                              <span className="w-7 text-center font-bold text-xs text-dark dark:text-stone-100">{item?.quantity || 1}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-medium dark:text-stone-300"
                                onClick={() => item?._id && updateQuantity(item._id, (item?.quantity || 1) + 1)}
                              >
                                <Plus size={12} />
                              </Button>
                            </div>

                            <p className="font-black text-base sm:text-lg text-primary dark:text-amber-300">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-card text-card-foreground rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_30px_rgba(61,39,26,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-stone-200/70 dark:border-stone-800 sticky top-24 space-y-6">
            <h2 className="text-2xl font-serif font-black text-dark dark:text-stone-100">{t('cart.orderSummary')}</h2>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-dark dark:text-stone-100">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>{t('cart.estimatedDelivery')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">{t('cart.freeNairobi')}</span>
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-stone-400 leading-relaxed">
                {t('cart.deliveryNote')}
              </p>
              
              <Separator className="bg-border/40 dark:bg-stone-800" />
              
              <div className="flex justify-between items-center text-xl font-black text-dark dark:text-stone-100 pt-1">
                <span>{t('cart.total')}</span>
                <span className="text-primary dark:text-amber-300">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Button 
              className="w-full btn-primary h-14 rounded-2xl text-base font-black group shadow-md cursor-pointer"
              onClick={() => navigate('/checkout')}
              disabled={!hasItems}
            >
              {t('cart.proceedToCheckout')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground dark:text-stone-400 font-medium">
              <Truck size={14} className="text-primary" />
              <span>{t('cart.freeDelivery')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
