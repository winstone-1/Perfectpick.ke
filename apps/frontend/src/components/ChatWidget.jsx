import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Package, ArrowRight, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const url = `https://wa.me/254787251690?text=${encodeURIComponent(`Hi PerfectPick Support, ${message}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle support chat"
        className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-primary hover:bg-primary-hover text-white shadow-[0_8px_25px_rgba(192,128,80,0.4)] flex items-center justify-center border border-white/20 transition-transform duration-200 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              <MessageCircle size={22} fill="currentColor" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-stone-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Compact Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[300px] sm:w-[340px] bg-card text-card-foreground rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.22)] overflow-hidden border border-stone-200/80 dark:border-stone-800"
          >
            {/* Header */}
            <div className="bg-dark text-footer-text p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-serif font-black text-sm">
                    P
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-dark" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#faf7f4] leading-none">Perfect Pick Concierge</h3>
                  <p className="text-[11px] text-footer-text/70 mt-1 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-300" /> Available on WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-footer-text/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-surface dark:bg-stone-900/80 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-xs text-medium dark:text-stone-300 leading-relaxed">
                👋 Hello! How can we assist with your luxury order or styling today?
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <a
                  href="https://wa.me/254787251690?text=Hi%20PerfectPick%2C%20I%20have%20a%20question%20about%20your%20collection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <FaWhatsapp size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 leading-none">Chat on WhatsApp</p>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">+254 787 251 690</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="w-full p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-surface/50 dark:bg-stone-900/50 hover:bg-surface dark:hover:bg-stone-800/80 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                      <Package size={14} />
                    </div>
                    <span className="text-xs font-bold text-dark dark:text-stone-200">Track My Order</span>
                  </div>
                  <ArrowRight size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Message Input Area */}
              <form onSubmit={handleSend} className="relative pt-1">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="h-10 pr-10 rounded-xl bg-surface dark:bg-stone-900 border-stone-200/70 dark:border-stone-700 text-xs text-dark dark:text-stone-100 placeholder:text-muted-foreground focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 top-[13px] text-primary hover:text-primary-hover disabled:opacity-40 transition-colors p-1"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

            {/* Footer / Branding */}
            <div className="px-4 py-2.5 bg-surface/60 dark:bg-stone-950/60 text-center border-t border-stone-200/40 dark:border-stone-800/60">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground dark:text-stone-400 font-bold">
                Perfect Pick Nairobi • Mon-Sat 8:30AM–7:30PM
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;

