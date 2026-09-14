import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const STORAGE_KEY = 'pp-cookie-consent';

/**
 * CookieConsent — acceptance banner that persists the visitor's preference
 * in localStorage. Accept / Decline both dismiss permanently; a "Manage"
 * reset is exposed via the footer (clears the key) — see Footer link.
 */
const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: value, at: new Date().toISOString() }));
    } catch { /* storage unavailable — just dismiss */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          role="dialog"
          aria-live="polite"
          aria-label={t('cookies.title', { defaultValue: 'Cookie preferences' })}
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[70] bg-card text-card-foreground rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.25)] border border-stone-200/80 dark:border-stone-800 p-5 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary-deep dark:text-primary-light flex items-center justify-center shrink-0 border border-primary/20">
              <Cookie size={18} />
            </div>
            <div className="flex-1">
              <h2 className="font-serif font-bold text-sm text-dark dark:text-stone-100">
                {t('cookies.title', { defaultValue: 'We use cookies' })}
              </h2>
              <p className="text-xs text-muted-foreground dark:text-stone-400 leading-relaxed mt-1">
                {t('cookies.desc', { defaultValue: 'We use cookies to improve your shopping experience, remember preferences, and analyse traffic. You can accept or decline.' })}
              </p>
            </div>
            <button onClick={() => choose('dismissed')} aria-label={t('common.close')} className="text-muted-foreground hover:text-dark dark:hover:text-stone-100 p-1 rounded-full hover:bg-surface transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => choose('declined')} variant="outline" className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider btn-outline" aria-label={t('cookies.decline', { defaultValue: 'Decline cookies' })}>
              {t('cookies.decline', { defaultValue: 'Decline' })}
            </Button>
            <Button onClick={() => choose('accepted')} className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider btn-primary" aria-label={t('cookies.accept', { defaultValue: 'Accept cookies' })}>
              {t('cookies.accept', { defaultValue: 'Accept' })}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
