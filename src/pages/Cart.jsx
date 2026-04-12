import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-surface rounded-full flex items-center justify-center text-primary"
        >
          <ShoppingBag size={64} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-dark">Your bag is empty</h1>
          <p className="text-muted-foreground max-w-xs">
            Looks like you haven't added any luxury pieces to your cart yet.
          </p>
        </div>
        <Link to="/products">
          <Button className="btn-primary h-12 px-10 rounded-full">Explore Our Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-black text-dark">Shopping Bag ({cart.length})</h1>
            <Link to="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={`${item.productId._id}-${item.variant}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-none shadow-sm overflow-hidden bg-white/50 hover:bg-white transition-colors">
                    <CardContent className="p-4 md:p-6 flex gap-4 md:gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.productId.image ? (
                          <img 
                            src={item.productId.image} 
                            alt={item.productId.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag size={32} className="text-medium opacity-20" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-serif font-bold text-lg text-dark">{item.productId.name}</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c08050] mt-1">
                              {item.variant}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-red-500 -mt-1 -mr-1"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border border-border/10 rounded-lg p-0.5 bg-bg/50">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-medium"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-medium"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <p className="font-bold text-dark">{formatPrice(item.productId.price * item.quantity)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/10 sticky top-24 space-y-8">
            <h2 className="text-2xl font-serif font-black text-dark">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-medium">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-medium">
                <span>Delivery</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest mt-1">Free</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                * Standard delivery within Nairobi takes 1-2 business days.
              </p>
              
              <Separator className="bg-border/10" />
              
              <div className="flex justify-between items-center text-xl font-black text-dark pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Button 
              className="w-full btn-primary h-14 rounded-2xl text-lg font-black group"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
              <Truck size={14} />
              <span>Free delivery across Nairobi CBD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
