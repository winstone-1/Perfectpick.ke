import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

/**
 * BackToTop button
 *
 * Before: fixed bottom-8 right-8 — overlapped ChatWidget (fixed bottom-5 right-5)
 * After:  fixed bottom-[5.5rem] right-5 — sits 20px above the ChatWidget FAB
 *
 * Three-button layout (no overlaps at any viewport):
 *   bottom-left  : AccessibilityWidget  (fixed bottom-5 left-5)
 *   bottom-right : ChatWidget FAB       (fixed bottom-5 right-5)
 *   above-right  : BackToTop            (fixed bottom-[5.5rem] right-5)
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-[5.5rem] right-5 z-[60]"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            aria-label="Back to top"
            className="h-11 w-11 rounded-full bg-dark text-white shadow-xl hover:bg-primary transition-all duration-300 border-none group"
          >
            <ChevronUp size={22} className="group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;