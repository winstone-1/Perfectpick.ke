import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsapSafe } from '../lib/gsapSafe';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { cart, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Nairobi',
  });

  // Paystack test-mode public key (frontend reference only — charge is
  // initiated server-side via /payments/mpesa using PAYSTACK_SECRET_KEY).
  // Shows a "Test mode" badge so QA can confirm test keys are wired.
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  const isPaystackTestMode = paystackPublicKey.startsWith('pk_test_');

  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [fallbackData, setFallbackData] = useState({ tillNumber: '3175088' });

  // Multi-step checkout: 1 = shipping details, 2 = payment, success replaces the
  // payment panel. Inline validation errors are keyed by field name.
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const cartItems = Array.isArray(cart) ? cart : [];
  const hasItems = cartItems.length > 0;
  const total = cartTotal || 0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear a field's error as soon as the user edits it
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // Inline validation for the shipping step — returns true when valid
  // Validates fullName, email, phone (Kenyan), and address inline.
  const validateShipping = () => {
    const next = {};
    if (!formData.fullName?.trim() || formData.fullName.trim().length < 3) {
      next.fullName = t('checkout.validation.fullName');
    }
    // Email is required by Paystack (receipt + charge identification)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email?.trim() || '')) {
      next.email = t('checkout.validation.email', { defaultValue: 'Enter a valid email address' });
    }
    // Kenyan phone: 07XX…, 01XX…, +254… or 254… followed by 9 digits
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(formData.phone?.replace(/[\s-]/g, '') || '')) {
      next.phone = t('checkout.validation.phone');
    }
    if (!formData.address?.trim() || formData.address.trim().length < 6) {
      next.address = t('checkout.validation.address');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Return to the shipping step and reset transient payment state.
  const goBackToShipping = () => {
    setPaymentStatus('idle');
    setStep(1);
  };

  // Keyboard shortcuts: Enter advances from step 1 when valid, Esc cancels
  // an in-flight payment prompt and returns to shipping.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (paymentStatus === 'waiting' || paymentStatus === 'fallback' || paymentStatus === 'failed') {
          goBackToShipping();
        } else if (step === 2) {
          setStep(1);
        }
      }
      if (e.key === 'Enter' && step === 1 && paymentStatus === 'idle') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'SELECT') {
          e.preventDefault();
          if (validateShipping()) setStep(2);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentStatus, formData]);

  const handlePay = async (e) => {
    e.preventDefault();

    // Re-validate before paying (user may have edited fields after step 1)
    if (!validateShipping()) {
      setStep(1);
      return toast.error(t('checkout.pleaseFillDetails'));
    }

    if (!hasItems) {
      return toast.error(t('checkout.cartEmpty'));
    }

    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Prefer the typed checkout email (required by Paystack); fall back to account email.
      const email = formData.email?.trim() || storedUser?.email || storedUser?.data?.email || 'customer@example.com';

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

      const { data: paystackResponse } = await api.post('/payments/mpesa', {
        phone: formData.phone,
        amount: total,
        email,
        orderId: orderData.order._id,
      });

      setCheckoutRequestId(paystackResponse.reference);
      setPaymentStatus('waiting');
      toast.success(paystackResponse.message || t('checkout.stkJournal'));
    } catch (error) {
      console.error('Payment initiation error:', error);
      const isFallback = error.response?.data?.fallback;
      if (isFallback) {
        setFallbackData({ tillNumber: error.response.data.tillNumber || '3175088' });
        setPaymentStatus('fallback');
        toast.info(t('checkout.stkJournalFailed'));
      } else {
        toast.error(error.response?.data?.message || t('checkout.paymentFailedMsg'));
        setPaymentStatus('failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutRequestId) {
      toast.error(t('checkout.noPaymentRef'));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/payments/charge/${checkoutRequestId}`);

      if (data.status === 'success') {
        setPaymentStatus('success');
        if (fetchCart) await fetchCart();
        toast.success(t('checkout.paymentConfirmedMsg'));
      } else {
        toast.error(`${t('checkout.paymentStatusPrefix')} ${data.status}.`);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(t('checkout.couldNotConfirm'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentStatus !== 'waiting' || !checkoutRequestId) return;

    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await api.get(`/payments/charge/${checkoutRequestId}`);
        if (data.status === 'success') {
          clearInterval(interval);
          setPaymentStatus('success');
          if (fetchCart) await fetchCart();
          toast.success(t('checkout.paymentConfirmedMsg'));
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.info(t('checkout.stkJournalTimedOut'));
        }
      } catch {
        // Silently retry on network errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStatus, checkoutRequestId, fetchCart, t]);

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

  // Entrance reveal — gsapSafe skips silently when the container isn't
  // mounted (empty cart early-returns null below, so containerRef is null
  // and '.checkout-col' doesn't exist — previously a GSAP target error).
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsapSafe.context(containerRef, () => {
      gsapSafe.from(containerRef, '.checkout-col', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsapSafe.from(containerRef, '.checkout-card', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.3,
      });
    });
    return () => ctx?.revert();
  }, []);

  // Payment-state flourishes — scoped to the container and fully reverted on
  // status change/unmount. The old version used document-wide selectors and
  // leaked the infinite waiting-spinner tween on every status flip.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsapSafe.context(containerRef, () => {
      if (paymentStatus === 'fallback') {
        gsapSafe.fromTo(containerRef, '.checkout-till',
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }
        );
      }
      if (paymentStatus === 'success') {
        gsapSafe.fromTo(containerRef, '#success-check',
          { scale: 0, rotation: -15 },
          { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' }
        );
      }
      if (paymentStatus === 'waiting') {
        gsapSafe.to(containerRef, '.waiting-spinner', { rotation: 360, duration: 1, repeat: -1, ease: 'linear' });
      }
    });
    return () => ctx?.revert();
  }, [paymentStatus]);

  if (!hasItems && paymentStatus === 'idle') {
    return null;
  }

  const whatsappCheckoutHelp = `https://wa.me/254787251690?text=${encodeURIComponent(
    `Hi PerfectPick Support! I need help with my order checkout (${formData.fullName ? `Name: ${formData.fullName}, ` : ''}Total: ${formatPrice(total)})`
  )}`;

  return (
    <div ref={containerRef} className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
      {/* Live region announces payment status changes to screen readers */}
      <div aria-live="polite" role="status" className="sr-only">
        {paymentStatus === 'waiting' && t('checkout.checkYourPhone')}
        {paymentStatus === 'success' && t('checkout.paymentConfirmed')}
        {paymentStatus === 'failed' && t('checkout.paymentFailed')}
        {paymentStatus === 'fallback' && t('checkout.automatedTimedOut')}
      </div>
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 max-w-7xl mx-auto">
        {/* Shipping & Payment Column */}
        <div className="flex-1 space-y-8 checkout-col">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} aria-label={t('common.back', { defaultValue: 'Back to cart' })} className="rounded-full hover:bg-surface dark:hover:bg-stone-800">
              <ChevronLeft size={22} />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">{t('checkout.title')}</h1>
              <p className="text-xs text-muted-foreground dark:text-stone-400 font-bold uppercase tracking-widest mt-0.5">{t('checkout.securePayment')}</p>
              {isPaystackTestMode && (
                <p className="mt-1 inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50">
                  Paystack test mode
                </p>
              )}
            </div>
          </div>

          {/* Step indicator — aria-current marks the active step for screen readers */}
          <ol className="flex items-center gap-2 text-xs font-black uppercase tracking-widest" aria-label="Checkout progress">
            {[1, 2].map((s, i) => (
              <li key={s} className="flex items-center gap-2" aria-current={step === s ? 'step' : undefined}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-colors ${
                  step > s ? 'bg-emerald-500 border-emerald-500 text-white' :
                  step === s ? 'bg-primary border-primary text-white' :
                  'border-stone-300 dark:border-stone-700 text-muted-foreground'}`}>
                  {step > s ? '✓' : s}
                </span>
                <span className={step === s ? 'text-primary dark:text-primary-light' : 'text-muted-foreground dark:text-stone-400'}>
                  {s === 1 ? t('checkout.stepShipping') : t('checkout.stepPayment')}
                </span>
                {i === 0 && <span className="w-8 h-px bg-stone-300 dark:bg-stone-700" aria-hidden="true" />}
              </li>
            ))}
          </ol>

          {/* Shipping Information — step 1 only */}
          {step === 1 && (
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_8px_30px_rgba(61,39,26,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-[2rem] overflow-hidden checkout-card bg-card">
            <div className="bg-surface/80 dark:bg-stone-800/80 px-8 py-5 border-b border-stone-200/50 dark:border-stone-800 flex items-center gap-3">
              <Truck className="text-primary" size={20} />
              <h2 className="font-serif font-bold text-lg tracking-tight text-dark dark:text-stone-100">{t('checkout.shippingDetails')}</h2>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary" htmlFor="checkout-fullName">{t('checkout.fullName')}</label>
                  <Input
                    id="checkout-fullName"
                    name="fullName"
                    placeholder={t('checkout.fullNamePlaceholder')}
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 font-bold" role="alert">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary" htmlFor="checkout-email">{t('checkout.email', { defaultValue: 'Email' })}</label>
                  <Input
                    id="checkout-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t('checkout.emailPlaceholder', { defaultValue: 'you@example.com' })}
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'checkout-email-error' : undefined}
                  />
                  {errors.email && <p id="checkout-email-error" className="text-xs text-red-500 font-bold" role="alert">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary" htmlFor="checkout-phone">{t('checkout.mpesaPhone')}</label>
                  <Input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder={t('checkout.phonePlaceholder')}
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-bold" role="alert">{errors.phone}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-primary" htmlFor="checkout-address">{t('checkout.deliveryAddress')}</label>
                  <Input
                    id="checkout-address"
                    name="address"
                    placeholder={t('checkout.addressPlaceholder')}
                    className="h-12 rounded-xl bg-surface/50 dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-dark dark:text-stone-100"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={paymentStatus !== 'idle'}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && <p className="text-xs text-red-500 font-bold" role="alert">{errors.address}</p>}
                </div>
              </div>

              {/* Step 1 → continue to payment */}
              <Button
                className="w-full btn-primary h-14 rounded-2xl text-base font-black shadow-md cursor-pointer"
                onClick={() => { if (validateShipping()) setStep(2); }}
              >
                {t('checkout.continueToPayment')}
              </Button>
            </CardContent>
          </Card>
          )}

          {/* M-Pesa Section — step 2; aria-live announces status to AT */}
          <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_8px_30px_rgba(61,39,26,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-[2rem] overflow-hidden checkout-card bg-card">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/60 px-8 py-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center gap-3">
              <Smartphone className="text-emerald-600 dark:text-emerald-400" size={20} />
              <h2 className="font-serif font-bold text-lg text-emerald-950 dark:text-emerald-200 tracking-tight">{t('checkout.paymentMethod')}</h2>
              {step === 2 && paymentStatus === 'idle' && (
                <button onClick={goBackToShipping} className="ml-auto text-xs font-bold text-muted-foreground dark:text-stone-400 hover:text-primary underline underline-offset-2 cursor-pointer" aria-label={t('checkout.backToShipping', { defaultValue: 'Back to shipping details' })}>
                  ← {t('checkout.backToShipping', { defaultValue: 'Back' })}
                </button>
              )}
            </div>
            <CardContent className="p-6 sm:p-8" aria-live="polite">
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
                        <span className="text-xs font-black text-muted-foreground dark:text-stone-400 uppercase tracking-wider">{t('checkout.tillNumber')}</span>
                        <span className="text-xl font-mono font-black text-primary dark:text-primary-light">3175088</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 text-center uppercase tracking-widest font-black">
                        {t('checkout.perfectPickSelection')}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {t('checkout.mpesaPromptDesc')}
                    </div>

                    <Button
                      className="w-full bg-[#25a538] hover:bg-[#1f8c2e] text-white h-14 rounded-2xl text-lg font-black shadow-md cursor-pointer transition-transform active:scale-98"
                      onClick={handlePay}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin" /> : t('checkout.payWithMpesa')}
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
                      <h3 className="text-2xl font-serif font-black text-dark dark:text-stone-100">{t('checkout.checkYourPhone')}</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm max-w-sm mx-auto">
                        {t('checkout.stkSentTo')}{' '}
                        <span className="font-bold text-dark dark:text-stone-100">{formData.phone}</span>. {t('checkout.enterPinToComplete')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-13 rounded-2xl font-black text-base shadow-md cursor-pointer"
                        onClick={handleConfirmPayment}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : t('checkout.confirmPin')}
                      </Button>
                      <button
                        className="text-xs text-red-500 font-bold hover:underline cursor-pointer py-1"
                        onClick={() => setPaymentStatus('idle')}
                      >
                        {t('checkout.cancelOrRetry')}
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
                        <span>{t('checkout.automatedTimedOut')}</span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        {t('checkout.payManually')}
                      </p>
                    </div>

                    <div className="bg-surface dark:bg-stone-800 p-6 rounded-2xl space-y-3 border-2 border-primary/30">
                      <p className="text-[10px] font-black text-muted-foreground dark:text-stone-400 uppercase tracking-widest text-center">{t('checkout.buyGoodsTill')}</p>
                      <p className="text-4xl font-mono font-black text-primary dark:text-primary-light text-center tracking-tighter checkout-till">{fallbackData.tillNumber}</p>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 text-center uppercase tracking-widest font-black">
                        {t('checkout.perfectPickSelection')}
                      </p>
                    </div>

                    <div className="space-y-3 bg-surface/50 dark:bg-stone-900/60 p-5 rounded-2xl border border-stone-200/50 dark:border-stone-800">
                      <h4 className="text-xs font-black uppercase tracking-widest text-dark dark:text-stone-100">{t('checkout.stepByStep')}</h4>
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
                      {t('checkout.ivePaid')}
                    </Button>
                    <button
                      className="w-full text-xs font-bold text-muted-foreground dark:text-stone-400 hover:text-primary transition-colors cursor-pointer text-center"
                      onClick={() => setPaymentStatus('idle')}
                    >
                      {t('checkout.tryAgain')}
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
                      <h3 className="text-3xl font-serif font-black text-dark dark:text-stone-100">{t('checkout.paymentConfirmed')}</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm">
                        {t('checkout.orderPlaced', { id: orderId?.slice(-6).toUpperCase() })}
                      </p>
                    </div>
                    <Button
                      className="btn-primary h-12 px-8 rounded-xl"
                      onClick={() => navigate('/orders')}
                    >
                      {t('checkout.viewMyOrders')}
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
                      <h3 className="text-2xl font-serif font-black text-dark dark:text-stone-100">{t('checkout.paymentFailed')}</h3>
                      <p className="text-muted-foreground dark:text-stone-300 text-sm">{t('checkout.paymentFailedDesc')}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="btn-outline h-12 px-8 rounded-xl"
                      onClick={() => setPaymentStatus('idle')}
                    >
                      {t('checkout.tryAgainBtn')}
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
            <h2 className="text-2xl font-serif font-black text-dark dark:text-stone-100">{t('checkout.yourOrder')}</h2>

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
                    <p className="text-[10px] text-muted-foreground dark:text-stone-400 uppercase font-bold">{item?.variant || t('cart.standard')} x {item?.quantity || 1}</p>
                    <p className="text-xs font-black text-primary dark:text-primary-light mt-0.5">{formatPrice((item?.product?.price || 0) * (item?.quantity || 1))}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/40 dark:bg-stone-800" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>{t('checkout.subtotal')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-medium dark:text-stone-300">
                <span>{t('checkout.deliveryNairobi')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">{t('checkout.free')}</span>
              </div>
              <Separator className="bg-border/30 dark:bg-stone-800" />
              <div className="flex justify-between text-xl font-black text-dark dark:text-stone-100 pt-1">
                <span>{t('checkout.total')}</span>
                <span className="text-primary dark:text-primary-light">{formatPrice(total)}</span>
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
              <span>{t('checkout.needHelp')}</span>
            </a>

            <div className="rounded-2xl bg-surface dark:bg-stone-800/80 p-4 flex gap-3 text-xs text-medium dark:text-stone-300 leading-relaxed border border-stone-200/50 dark:border-stone-700">
              <CreditCard className="text-primary shrink-0 mt-0.5" size={16} />
              <p>{t('checkout.mpesaEncrypted')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
