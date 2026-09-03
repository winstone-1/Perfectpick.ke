import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Package, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-footer-bg text-footer-text shadow-2xl flex items-center justify-center border border-white/10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <MessageCircle size={28} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-border/10"
          >
            {/* Header */}
            <div className="bg-[#3d271a] p-6 text-white space-y-2">
              <h3 className="text-2xl font-serif font-bold">Chat with us</h3>
              <p className="text-white/80 text-sm flex items-center gap-2">
                Hey 👋 please message us with any questions and we will do our best to respond ASAP!
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Message Input Area */}
              <div className="relative">
                <Input 
                  placeholder="Write message"
                  className="h-16 pr-12 rounded-2xl bg-surface dark:bg-zinc-800 border-border/20 focus:ring-primary text-lg"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover transition-colors">
                  <Send size={24} />
                </button>
              </div>

              {/* Instant Answers Section */}
              <div className="space-y-4">
                <h4 className="text-center text-medium font-bold text-lg">Instant answers</h4>
                
                <button 
                  className="w-full p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Package size={20} />
                    </div>
                    <span className="font-semibold text-medium">Track my order</span>
                  </div>
                  <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <div className="pt-2">
                  <Button className="w-full btn-primary h-12 rounded-xl text-lg">
                    Join now
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Footer / Branding */}
            <div className="px-6 py-4 bg-surface dark:bg-zinc-950/50 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Powered by Perfect Pick Support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
