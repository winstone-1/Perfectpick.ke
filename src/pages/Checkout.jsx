import React, { useState } from 'react';
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
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Nairobi',
  });

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, waiting, success, failed
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      return toast.error('Please fill in shipping details');
    }

    setLoading(true);
    try {
      // 1. Create Order
      const { data: orderData } = await api.post('/orders', {
        items: cart.map(item => ({
          productId: item.productId._id,
          variant: item.variant,
          quantity: item.quantity,
          price: item.productId.price
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        totalAmount: cartTotal
      });

      setOrderId(orderData.order._id);

      // 2. Initiate M-Pesa STK Push
      const { data: mpesaData } = await api.post('/mpesa/stkpush', {
        phone: formData.phone.replace(/^0/, '254'), // Kenyan format
        amount: cartTotal,
        orderId: orderData.order._id
      });

      setCheckoutRequestId(mpesaData.CheckoutRequestID);
      setPaymentStatus('waiting');
      toast.success('M-Pesa prompt sent to your phone');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/mpesa/query', {
        checkoutRequestId
      });

      if (data.ResultCode === '0') {
        setPaymentStatus('success');
        clearCart();
        toast.success('Payment confirmed! Your order is being processed.');
      } else {
        setPaymentStatus('failed');
        toast.error('Payment was not successful');
      }
    } catch (error) {
      toast.error('Could not confirm payment. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (cart.length === 0 && paymentStatus === 'idle') {
    navigate('/cart');
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
                      {loading ? <Loader2 className="animate-spin" /> : "Pay with M-Pesa"}
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
                      <p className="text-muted-foreground">We've sent an M-Pesa STK push to <span className="font-bold text-dark">{formData.phone}</span>. Enter your PIN to complete payment.</p>
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
                      <p className="text-muted-foreground">Your order <span className="font-bold text-dark">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully.</p>
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
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <div className="w-16 h-16 bg-surface rounded-lg flex-shrink-0 overflow-hidden">
                    <img src={item.productId.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-dark truncate">{item.productId.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.variant} x {item.quantity}</p>
                    <p className="text-xs font-bold text-primary mt-1">{formatPrice(item.productId.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/10" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-xl font-black text-dark">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
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
