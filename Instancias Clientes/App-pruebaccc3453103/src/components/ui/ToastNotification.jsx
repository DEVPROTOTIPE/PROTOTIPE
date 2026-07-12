import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastNotification({ show, type = 'success', message, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
        >
          <div className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 bg-[var(--color-surface)]/95 backdrop-blur-md ${
            type === 'success' 
              ? 'border-emerald-500/20 text-emerald-600' 
              : 'border-rose-500/20 text-rose-600'
          }`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            }`}>
              {type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              )}
            </div>
            <p className="text-xs font-bold leading-snug">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}