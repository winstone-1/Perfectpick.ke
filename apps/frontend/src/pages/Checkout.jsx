import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Smartphone, 
  ChevronLeft, 
  CreditCard, 
  Truck 
} from 'lucide-react';
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
      const { data } = await api.get(`/payments/verify/${checkoutRequestId}`);

      if (data.status === 'success') {
        setPaymentStatus('success');
        // Cart already cleared by order controller on backend — just refresh local state
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

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'KSH 0';
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

  if (!hasItems && paymentStatus === 'idle') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        {/* Shipping Form */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
              <ChevronLeft size={24} />
            </Button>
            <h1 className="text-3xl font-serif font-black text-dark">Checkout</h1>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-surface px-8 py-4 border-b border-border/10 flex items-center gap-2">
              <Truck className="text-primary" size={20} />
              <h2 className="font-serif font-bold text-lg">Shipping Information</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Full Name</label>
                  <Input
                    name="fullName"
                    placeholder="Recipient Name"
                    className="h-12 rounded-xl"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">M-Pesa Phone Number</label>
                  <Input
                    name="phone"
                    placeholder="0712XXXXXX"
                    className="h-12 rounded-xl"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Street Address / Building / Office</label>
                  <Input
                    name="address"
                    placeholder="e.g. Garden Estate, House 42"
                    className="h-12 rounded-xl"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Section */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-emerald-50 px-8 py-4 border-b border-emerald-100 flex items-center gap-2">
              <Smartphone className="text-emerald-600" size={20} />
              <h2 className="font-serif font-bold text-lg text-emerald-900">Payment Method: M-Pesa</h2>
            </div>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {paymentStatus === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="bg-surface p-6 rounded-2xl space-y-4 border border-border/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">M-Pesa Till No.</span>
                        <span className="text-lg font-mono font-black text-primary">3175088</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-black">
                        The Perfect Pick Selection
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 text-sm text-emerald-800 leading-relaxed">
                      Enter your M-Pesa phone number above. Click "Pay with M-Pesa" and you will receive a prompt to enter your PIN.
                    </div>
                    <Button
                      className="w-full bg-[#39b54a] hover:bg-[#329e41] text-white h-14 rounded-2xl text-lg font-black"
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-6 py-4"
                  >
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-dark">Check your phone</h3>
                      <p className="text-muted-foreground">
                        We've sent an M-Pesa STK push to{' '}
                        <span className="font-bold text-dark">{formData.phone}</span>. Enter your PIN to complete payment.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-bold"
                        onClick={handleConfirmPayment}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "I've paid — confirm"}
                      </Button>
                      <button
                        className="text-sm text-red-500 font-bold hover:underline"
                        onClick={() => setPaymentStatus('idle')}
                      >
                        Cancel payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {paymentStatus === 'fallback' && (
                  <motion.div
                    key="fallback"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 py-2"
                  >
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3 text-amber-800 font-bold">
                        <XCircle size={20} className="text-amber-600" />
                        <span>STK Push could not be sent</span>
                      </div>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Don't worry! You can still complete your order by paying manually to our Till Number below.
                      </p>
                    </div>

                    <div className="bg-surface p-6 rounded-2xl space-y-4 border-2 border-primary/20">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Buy Goods Till Number</p>
                        <p className="text-4xl font-mono font-black text-primary text-center tracking-tighter">{fallbackData.tillNumber}</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-xl border border-border/5">
                        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-black">
                          The Perfect Pick Selection
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-dark">How to pay:</h4>
                      <ol className="text-xs space-y-3 text-muted-foreground font-medium">
                        <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">1</span> Go to M-Pesa menu & select Lipa na M-Pesa</li>
                        <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">2</span> Select Buy Goods and Services</li>
                        <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">3</span> Enter Till Number: <span className="font-bold text-dark">{fallbackData.tillNumber}</span></li>
                        <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">4</span> Enter Amount: <span className="font-bold text-dark">{formatPrice(total)}</span></li>
                      </ol>
                    </div>

                    <Button
                      className="w-full btn-primary h-14 rounded-2xl text-lg font-black"
                      onClick={() => navigate('/orders')}
                    >
                      I've Paid — View My Orders
                    </Button>
                    <button
                      className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setPaymentStatus('idle')}
                    >
                      Try automated payment again
                    </button>
                  </motion.div>
                )}

                {paymentStatus === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <CheckCircle2 className="mx-auto text-emerald-500" size={64} />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-black text-dark">Payment Confirmed!</h3>
                      <p className="text-muted-foreground">
                        Your order <span className="font-bold text-dark">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully.
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <XCircle className="mx-auto text-red-500" size={64} />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-black text-dark">Payment Failed</h3>
                      <p className="text-muted-foreground">Something went wrong with your transaction. Please try again.</p>
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
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/10 sticky top-24 space-y-8">
            <h2 className="text-2xl font-serif font-black text-dark">Your Order</h2>

            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
              {cartItems.map((item) => (
                <div key={item?._id || `${item?.product?._id}-${item?.variant}`} className="flex gap-4">
                  <div className="w-16 h-16 bg-surface rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={item?.product?.images?.[0] || item?.product?.image || '/placeholder-image.jpg'}
                      alt={item?.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-dark truncate">{item?.product?.name || 'Product'}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{item?.variant || 'Standard'} x {item?.quantity || 1}</p>
                    <p className="text-xs font-bold text-primary mt-1">{formatPrice((item?.product?.price || 0) * (item?.quantity || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/10" />

            <div className="space-y-2">
              <div className="flex justify-between text-xl font-black text-dark">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-4 flex gap-3 text-xs text-medium leading-relaxed">
              <CreditCard className="text-primary flex-shrink-0" size={16} />
              <p>Your payment is secure via Safaricom M-Pesa. Please do not close this window during the process.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;