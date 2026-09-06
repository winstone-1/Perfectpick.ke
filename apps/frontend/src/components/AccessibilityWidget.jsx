import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Accessibility, X, Contrast, Type, Minus, Plus } from "lucide-react";

const FONT_STEPS = ["normal", "large", "x-large"];
const FONT_LABELS = { normal: "100%", large: "112%", "x-large": "125%" };
const FONT_SIZES = { normal: "100%", large: "112.5%", "x-large": "125%" };
const save = (p) => { try { localStorage.setItem("pp-a11y", JSON.stringify(p)); } catch {} };
const load = () => { try { return JSON.parse(localStorage.getItem("pp-a11y") || "{}"); } catch { return {}; } };

const AccessibilityWidget = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hc, setHC] = useState(false);
  const [fs, setFS] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const p = load();
    if (p.highContrast) { setHC(true); document.documentElement.classList.add("high-contrast"); }
    if (p.fontStep) { setFS(p.fontStep); document.documentElement.style.fontSize = FONT_SIZES[FONT_STEPS[p.fontStep]]; }
  }, []);

  useEffect(() => {
    if (!open) return;
    const clickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", clickOut);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", clickOut); document.removeEventListener("keydown", esc); };
  }, [open]);

  const setContrast = (v) => { setHC(v); document.documentElement.classList.toggle("high-contrast", v); save({ highContrast: v, fontStep: fs }); };
  const setFont = (i) => { setFS(i); document.documentElement.style.fontSize = FONT_SIZES[FONT_STEPS[i]]; save({ highContrast: hc, fontStep: i }); };
  const reset = () => { setContrast(false); setFont(0); };
  const hasChanges = hc || fs > 0;

  return (
    <div ref={ref} className="fixed bottom-5 left-5 z-[60] flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}} transition={{duration:0.2,ease:"easeOut"}}
            role="dialog" aria-label={t('accessibility.title')}
            className="w-64 bg-card text-card-foreground rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.2)] border border-stone-200/80 dark:border-stone-800 overflow-hidden">
            <div className="bg-dark text-footer-text p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary"><Accessibility size={15} /></div>
                <span className="font-serif font-bold text-[#faf7f4] text-sm">{t('accessibility.title')}</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="text-footer-text/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"><X size={15} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <Contrast size={16} className="text-primary dark:text-amber-300 shrink-0" />
                  <div><p className="text-xs font-bold text-dark dark:text-stone-100 leading-none">{t('accessibility.highContrast')}</p><p className="text-[10px] text-muted-foreground mt-0.5">{t('accessibility.boostVisibility')}</p></div>
                </div>
                <button role="switch" aria-checked={hc} onClick={() => setContrast(!hc)}
                  className={"relative w-10 h-5 rounded-full transition-colors duration-200 border " + (hc ? "bg-primary border-primary" : "bg-stone-200 dark:bg-stone-700 border-stone-300 dark:border-stone-600")}>
                  <span className={"absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 " + (hc ? "translate-x-5" : "translate-x-0")} />
                  <span className="sr-only">{hc ? t('common.cancel') : t('common.confirm')} {t('accessibility.highContrast')}</span>
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-surface dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Type size={16} className="text-primary dark:text-amber-300 shrink-0" />
                  <div><p className="text-xs font-bold text-dark dark:text-stone-100 leading-none">{t('accessibility.textSize')}</p><p className="text-[10px] text-muted-foreground mt-0.5">{t('accessibility.currentSize', { size: FONT_LABELS[FONT_STEPS[fs]] })}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fs > 0 && setFont(fs - 1)} disabled={fs === 0} aria-label={t('common.back')}
                    className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Minus size={14} /></button>
                  <div className="flex-1 flex items-center justify-center gap-1.5">
                    {FONT_STEPS.map((_, i) => (
                      <button key={i} onClick={() => setFont(i)} aria-label={FONT_LABELS[FONT_STEPS[i]]}
                        className={"rounded-full transition-all duration-200 " + (i === fs ? "w-5 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-stone-300 dark:bg-stone-600 hover:bg-primary/50")} />
                    ))}
                  </div>
                  <button onClick={() => fs < FONT_STEPS.length - 1 && setFont(fs + 1)} disabled={fs === FONT_STEPS.length - 1} aria-label={t('common.next')}
                    className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              {hasChanges && <button onClick={reset} className="w-full text-xs text-muted-foreground hover:text-primary dark:hover:text-amber-300 transition-colors py-1 font-bold uppercase tracking-wider">{t('accessibility.resetDefaults')}</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.94}} onClick={() => setOpen(v => !v)}
        aria-label={t('accessibility.title')} aria-expanded={open} title={t('accessibility.title')}
        className={"relative w-12 h-12 rounded-full text-white shadow-[0_8px_25px_rgba(0,0,0,0.18)] flex items-center justify-center border border-white/20 transition-all duration-200 cursor-pointer " + (open || hasChanges ? "bg-dark dark:bg-stone-800 ring-2 ring-primary/50" : "bg-dark/80 dark:bg-stone-800 hover:bg-dark")}>
        <Accessibility size={20} />
        {hasChanges && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full ring-2 ring-white dark:ring-stone-900" />}
      </motion.button>
    </div>
  );
};

export default AccessibilityWidget;
