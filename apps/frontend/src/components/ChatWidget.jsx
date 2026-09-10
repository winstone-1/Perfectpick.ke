import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Send, Package, ArrowRight, Sparkles, Minus, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import api from "../api/axios";

const WHATSAPP_URL = "https://wa.me/254787251690?text=Hi%20PerfectPick%2C%20I%20have%20a%20question";
const WHATSAPP_FALLBACK = "Sorry, I'm having trouble right now — chat with us directly on WhatsApp (+254 787 251 690): https://wa.me/254787251690";

const ChatWidget = () => {
  const { t } = useTranslation();
  const [state, setState] = useState("closed");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', content:string}
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const isOpen = state === "open";
  const isMinimised = state === "minimised";
  const toggle = () => { if (state === "closed") setState("open"); else if (state === "open") setState("minimised"); else setState("open"); };
  const close = () => setState("closed");
  const minimise = () => setState("minimised");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);
    try {
      // send history prior to this message (last 10 turns) plus the new message
      const { data } = await api.post("/chat", { message: text, history: nextMessages.slice(0, -1).slice(-10).map(m => ({ role: m.role, content: m.content })) });
      const reply = data?.reply?.trim() || WHATSAPP_FALLBACK;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 429) {
        setMessages(prev => [...prev, { role: "assistant", content: serverMsg || "You're sending messages too quickly. Please wait a minute and try again." }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: WHATSAPP_FALLBACK }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{opacity:0,y:30,scale:0.92}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:30,scale:0.92}} transition={{duration:0.25,ease:"easeOut"}}
            className="w-[300px] sm:w-[360px] bg-card text-card-foreground rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.22)] overflow-hidden border border-stone-200/80 dark:border-stone-800 flex flex-col max-h-[520px]">
            <div className="bg-stone-900 dark:bg-stone-950 text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-amber-300 font-serif font-black text-sm">P</div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-stone-900" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white leading-none">{t('chatWidget.assistantName')}</h3>
                  <p className="text-[11px] text-stone-300 mt-1 flex items-center gap-1"><Sparkles size={10} className="text-amber-300" /> {t('chatWidget.assistantTitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={minimise} className="text-stone-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors" aria-label={t('chatWidget.minimiseChat')}><Minus size={15} /></button>
                <button onClick={close} className="text-stone-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors" aria-label={t('common.close')}><X size={15} /></button>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-card">
              <div className="bg-surface dark:bg-stone-900/80 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-200 leading-relaxed">
                {t('chatWidget.greeting')}
              </div>
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-white ml-8 rounded-br-md' : 'bg-surface dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800 text-stone-700 dark:text-stone-200 mr-4 rounded-bl-md'}`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-stone-400">
                  <Loader2 size={14} className="animate-spin" /> Pia is typing...
                </div>
              )}
              {/* Permanent WhatsApp handoff — never removed */}
              <div className="pt-2 space-y-2">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><FaWhatsapp size={14} /></div>
                    <div className="text-left"><p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 leading-none">{t('chatWidget.chatOnWhatsApp')}</p><p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">+254 787 251 690</p></div>
                  </div>
                  <ArrowRight size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link to="/orders" onClick={close} className="w-full p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-surface/50 dark:bg-stone-900/50 hover:bg-surface dark:hover:bg-stone-800/80 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center"><Package size={14} /></div>
                    <span className="text-xs font-bold text-dark dark:text-stone-200">{t('chatWidget.trackMyOrder')}</span>
                  </div>
                  <ArrowRight size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
            <form onSubmit={send} className="relative p-3 border-t border-stone-200/40 dark:border-stone-800/60 bg-card shrink-0">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('chatWidget.typeMessage')} disabled={loading}
                className="h-10 pr-10 rounded-xl bg-surface dark:bg-stone-900 border-stone-200/70 dark:border-stone-700 text-xs" />
              <button type="submit" disabled={!message.trim() || loading} className="absolute right-5 top-[22px] text-primary hover:text-primary-hover disabled:opacity-40 transition-colors p-1" aria-label="Send"><Send size={15} /></button>
            </form>
            <div className="px-4 py-2.5 bg-surface/60 dark:bg-stone-950/60 text-center border-t border-stone-200/40 dark:border-stone-800/60 shrink-0">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground dark:text-stone-400 font-bold">{t('chatWidget.footer')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.94}} onClick={toggle}
        aria-label={isOpen ? t('chatWidget.minimiseChat') : isMinimised ? t('chatWidget.openChat') : t('chatWidget.chatWithPia')}
        aria-expanded={isOpen}
        className="relative w-12 h-12 rounded-full bg-primary hover:bg-primary-hover text-white shadow-[0_8px_25px_rgba(192,128,80,0.4)] flex items-center justify-center border border-white/20 transition-transform duration-200 cursor-pointer">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="minus" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}><Minus size={20} /></motion.div>
          ) : (
            <motion.div key="chat" initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0,opacity:0}} className="relative">
              <MessageCircle size={22} fill="currentColor" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-stone-900" />
              {isMinimised && <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white dark:ring-stone-900 animate-pulse" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
