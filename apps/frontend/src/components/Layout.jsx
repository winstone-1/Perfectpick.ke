import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from './BackToTop';
import ChatWidget from './ChatWidget';
import AccessibilityWidget from './AccessibilityWidget';
import CookieConsent from './CookieConsent';

/**
 * Layout — shell for every page.
 *
 * Floating button positions (no overlaps):
 *   bottom-left  — AccessibilityWidget  (fixed bottom-5 left-5)
 *   bottom-right — ChatWidget FAB       (fixed bottom-5 right-5)
 *   above-right  — BackToTop            (fixed bottom-[5.5rem] right-5)
 */
const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />

      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <AccessibilityWidget />
      <BackToTop />
      <ChatWidget />
      <CookieConsent />

      <Footer />
    </div>
  );
};

export default Layout;
