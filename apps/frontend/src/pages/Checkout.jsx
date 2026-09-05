import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Smartphone, 
  ChevronLeft, 
  CreditCard, 
  Truck 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const Checkout = () => {
  const { cart, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Nairobi',
  });

  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [fallbackData, setFallbackData] = useState({ tillNumber: '3175088' });

  const cartItems = Array.isArray(cart) ? cart : [];
  const hasItems = cartItems.length > 0;
  const total = cartTotal || 0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      return toast.error('Please fill in shipping details');
    }

    if (!hasItems) {
      return toast.error('Your cart is empty');
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const email = user?.email || 'customer@example.com';

      // 1. Create Order — controller reads from DB cart, only needs shippingAddress
      const { data: orderData } = await api.post('/orders', {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
      });

      if (!orderData?.order?._id) {
        throw new Error('Failed to create order');
      }

      setOrderId(orderData.order._id);

      // 2. Initiate Paystack M-Pesa STK Push
      const { data: paystackResponse } = await api.post('/payments/mpesa', {
        phone: formData.phone,
        amount: total,
        email,
        orderId: orderData.order._id,
      });

      setCheckoutRequestId(paystackResponse.reference);
      setPaymentStatus('waiting');
      toast.success(paystackResponse.message || 'M-Pesa prompt sent to your phone');
    } catch (error) {
      console.error('Payment initiation error:', error);
      const isFallback = error.response?.data?.fallback;
      if (isFallback) {
        setFallbackData({ tillNumber: error.response.data.tillNumber || '3175088' });
        setPaymentStatus('fallback');
        toast.info('STK push failed. Please pay manually using the Till Number.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to initiate payment');
        setPaymentStatus('failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutRequestId) {
      toast.error('No payment reference found');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/payments/charge/${checkoutRequestId}`);

      if (data.status === 'success') {
        setPaymentStatus('success');
        if (fetchCart) await fetchCart();
        toast.success('Payment confirmed! Your order is being processed.');
      } else {
        toast.error(`Payment status: ${data.status}. Please wait or try again.`);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('Could not confirm payment. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-poll charge status while waiting for STK push
  useEffect(() => {
    if (paymentStatus !== 'waiting' || !checkoutRequestId) return;

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts × 5s = 2.5 min max
    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await api.get(`/payments/charge/${checkoutRequestId}`);
        if (data.status === 'success') {
          clearInterval(interval);
          setPaymentStatus('success');
          if (fetchCart) await fetchCart();
          toast.success('Payment confirmed! Your order is being processed.');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.info('STK prompt timed out. You can still confirm manually or try again.');
        }
      } catch {
        // Silently retry on network errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStatus, checkoutRequestId, fetchCart]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (!hasItems && paymentStatus === 'idle') {
      navigate('/cart');
    }
  }, [hasItems, paymentStatus, navigate]);

  // GSAP polish — visual only, respects prefers-reduced-motion, does not touch payment logic
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.checkout-col', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsap.from('.checkout-card', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (paymentStatus === 'fallback') {
      gsap.fromTo('.checkout-till',
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }
      );
    }
    if (paymentStatus === 'success') {
      gsap.fromTo('#success-check',
        { scale: 0, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' }
      );
    }
    if (paymentStatus === 'waiting') {
      gsap.to('.waiting-spinner', { rotation: 360, duration: 1, repeat: -1, ease: 'linear' });
    }
  }, [paymentStatus]);

  if (!hasItems && paymentStatus === 'idle') {
    return null;
  }

  const whatsappCheckoutHelp = `https://wa.me/254787251690?text=${encodeURIComponent(
    `Hi PerfectPick Support! I need help with my order checkout (${formData.fullName ? `Name: ${formData.fullName}, ` : ''}Total: ${formatPrice(total)})`
  )}`;

  return (
    <div ref={containerRef} className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 max-w-7xl mx-auto">
        {/* Shipping & Payment Column */}
        <div className="flex-1 space-y-8 checkout-col">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="rounded-full hover:bg-surface dark:hover:bg-stone-800">
              <ChevronLeft size={22} />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">Checkout</h1>
              <p className="text-xs text-muted-foreground dark:text-stone-400 font-bold uppercase tracking-widest mt-0.5">Secure M-Pesa Payment</p>
            </div>
          </div>

          {/* Shipping Information */}
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_8px_30px_rgba(61,39,26,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-[2rem] overflow-hidden checkout-card bg-card">
            <div className="bg-surface/80 dark:bg-stone-800/80 px-8 py-5 border-b border-stone-200/50 dark:border-stone-800 flex items-center gap-3">
              <Truck className="text-primary" size={20} />
              <h2 className="font-serif font-bold text-lg tracking-tight text-dark dark:text-stone-100">Shipping Details</h2>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary">Full Name</label>
                  <Input
                    name="fullName"
                    placeholder="e.g. Sarah Muthoni"
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary">M-Pesa Phone Number</label>
                  <Input
                    name="phone"
                    placeholder="0712XXXXXX"
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary">Delivery Address / House / Building</label>
                  <Input
                    name="address"
                    placeholder="e.g. Westlands, Mpaka Road, Suite 4B"
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Section */}
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_8px_30px_rgba(61,39,26,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-[2rem] overflow-hidden checkout-card bg-card">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/60 px-8 py-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center gap-3">
              <Smartphone className="text-emerald-600 dark:text-emerald-400" size={20} />
              <h2 className="font-serif font-bold text-lg text-emerald-950 dark:text-emerald-200 tracking-tight">Payment Method — M-Pesa</h2>
            </div>
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {paymentStatus === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="space-y-6"
                  >
                    <div className="bg-surface dark:bg-stone-800/80 p-6 rounded-2xl space-y-3 border border-stone-200/70 dark:border-stone-700">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-muted-foreground dark:text-stone-400 uppercase tracking-wider">M-Pesa Till No.</span>
                        <span className="text-xl font-mono font-black text-primary dark:text-amber-300">3175088</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 text-center uppercase tracking-widest font-black">
                        The Perfect Pick Selection
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      Enter your phone number above. Clicking <strong>"Pay with M-Pesa"</strong> will trigger an automated STK push prompt directly to your phone.
                    </div>

                    <Button
                      className="w-full bg-[#25a538] hover:bg-[#1f8c2e] text-white h-14 rounded-2xl text-lg font-black shadow-md cursor-pointer transition-transform active:scale-98"
                      onClick={handlePay}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'Pay with M-Pesa'}
                    </Button>
                  </motion.div>
                )}

                {paymentStatus === 'waiting' && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="text-center space-y-6 py-4"
                  >
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto waiting-spinner" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-black text-dark dark:text-stone-100">Check Your Phone</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm max-w-sm mx-auto">
                        An M-Pesa prompt has been sent to{' '}
                        <span className="font-bold text-dark dark:text-stone-100">{formData.phone}</span>. Enter your PIN to complete the transaction.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-13 rounded-2xl font-black text-base shadow-md cursor-pointer"
                        onClick={handleConfirmPayment}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "I've Entered PIN — Confirm"}
                      </Button>
                      <button
                        className="text-xs text-red-500 font-bold hover:underline cursor-pointer py-1"
                        onClick={() => setPaymentStatus('idle')}
                      >
                        Cancel or retry
                      </button>
                    </div>
                  </motion.div>
                )}

                {paymentStatus === 'fallback' && (
                  <motion.div
                    key="fallback"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="space-y-6 py-2"
                  >
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-bold text-sm">
                        <XCircle size={18} className="text-amber-600 dark:text-amber-400" />
                        <span>Automated prompt timed out</span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        Please pay manually via M-Pesa Buy Goods Till number below to complete your order.
                      </p>
                    </div>

                    <div className="bg-surface dark:bg-stone-800 p-6 rounded-2xl space-y-3 border-2 border-primary/30">
                      <p className="text-[10px] font-black text-muted-foreground dark:text-stone-400 uppercase tracking-widest text-center">Buy Goods Till Number</p>
                      <p className="text-4xl font-mono font-black text-primary dark:text-amber-300 text-center tracking-tighter checkout-till">{fallbackData.tillNumber}</p>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 text-center uppercase tracking-widest font-black">
                        The Perfect Pick Selection
                      </p>
                    </div>

                    <div className="space-y-3 bg-surface/50 dark:bg-stone-900/60 p-5 rounded-2xl border border-stone-200/50 dark:border-stone-800">
                      <h4 className="text-xs font-black uppercase tracking-widest text-dark dark:text-stone-100">Step-by-step:</h4>
                      <ol className="text-xs space-y-2 text-medium dark:text-stone-300 font-medium">
                        <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">1</span> M-Pesa &gt; Lipa na M-Pesa</li>
                        <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">2</span> Buy Goods and Services</li>
                        <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">3</span> Till Number: <strong className="text-dark dark:text-stone-100 ml-1">{fallbackData.tillNumber}</strong></li>
                        <li className="flex gap-2.5"><span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">4</span> Amount: <strong className="text-dark dark:text-stone-100 ml-1">{formatPrice(total)}</strong></li>
                      </ol>
                    </div>

                    <Button
                      className="w-full btn-primary h-14 rounded-2xl text-base font-black shadow-md cursor-pointer"
                      onClick={() => navigate('/orders')}
                    >
                      I've Paid — View My Orders
                    </Button>
                    <button
                      className="w-full text-xs font-bold text-muted-foreground dark:text-stone-400 hover:text-primary transition-colors cursor-pointer text-center"
                      onClick={() => setPaymentStatus('idle')}
                    >
                      Try automated STK payment again
                    </button>
                  </motion.div>
                )}

                {paymentStatus === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <CheckCircle2 id="success-check" className="mx-auto text-emerald-500" size={60} />
                    <div className="space-y-2">
                      <h3 className="text-3xl font-serif font-black text-dark dark:text-stone-100">Payment Confirmed!</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm">
                        Order <span className="font-mono font-black text-dark dark:text-stone-100">#{orderId?.slice(-6).toUpperCase()}</span> placed successfully.
                      </p>
                    </div>
                    <Button
                      className="btn-primary h-12 px-8 rounded-xl"
                      onClick={() => navigate('/orders')}
                    >
                      View My Orders
                    </Button>
                  </motion.div>
                )}

                {paymentStatus === 'failed' && (
                  <motion.div
                    key="failed"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <XCircle className="mx-auto text-red-500" size={60} />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-black text-dark dark:text-stone-100">Payment Failed</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm">We couldn't process this transaction. Please try again or use WhatsApp support.</p>
                    </div>
                    <Button
                      variant="outline"
                      className="btn-outline h-12 px-8 rounded-xl"
                      onClick={() => setPaymentStatus('idle')}
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[400px] checkout-col">
          <div className="bg-card text-card-foreground rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_30px_rgba(61,39,26,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-stone-200/70 dark:border-stone-800 sticky top-24 space-y-6 checkout-card">
            <h2 className="text-2xl font-serif font-black text-dark dark:text-stone-100">Your Order</h2>

            <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 scrollbar-hide">
              {cartItems.map((item) => (
                <div key={item?._id || `${item?.product?._id}-${item?.variant}`} className="flex gap-3.5 items-center">
                  <div className="w-14 h-14 bg-surface dark:bg-stone-800 rounded-xl flex-shrink-0 overflow-hidden border border-stone-200/50 dark:border-stone-700">
                    <img
                      src={item?.product?.images?.[0] || item?.product?.image || '/placeholder-image.jpg'}
                      alt={item?.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-dark dark:text-stone-100 truncate">{item?.product?.name || 'Product'}</h4>
                    <p className="text-[10px] text-muted-foreground dark:text-stone-400 uppercase font-bold">{item?.variant || 'Standard'} x {item?.quantity || 1}</p>
                    <p className="text-xs font-black text-primary dark:text-amber-300 mt-0.5">{formatPrice((item?.product?.price || 0) * (item?.quantity || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/40 dark:bg-stone-800" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>Delivery (Nairobi)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">Free</span>
              </div>
              <Separator className="bg-border/30 dark:bg-stone-800" />
              <div className="flex justify-between text-xl font-black text-dark dark:text-stone-100 pt-1">
                <span>Total</span>
                <span className="text-primary dark:text-amber-300">{formatPrice(total)}</span>
              </div>
            </div>

            {/* WhatsApp Assistance Button on Checkout */}
            <a
              href={whatsappCheckoutHelp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold transition-colors"
            >
              <FaWhatsapp size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Need help? Chat on WhatsApp</span>
            </a>

            <div className="rounded-2xl bg-surface dark:bg-stone-800/80 p-4 flex gap-3 text-xs text-medium dark:text-stone-300 leading-relaxed border border-stone-200/50 dark:border-stone-700">
              <CreditCard className="text-primary shrink-0 mt-0.5" size={16} />
              <p>M-Pesa encrypted payment. Your order is dispatched promptly once payment completes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;