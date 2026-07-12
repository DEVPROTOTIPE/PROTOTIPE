import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedNotificationBadge({
  count = 0,
  showZero = false,
  className = ''
}) {
  const displayCount = count > 99 ? '99+' : count;
  const isVisible = showZero || count > 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.span
            key={count} // Forzar re-render y animación en cada cambio de número
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15
            }}
            className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[var(--color-primary)] !text-[var(--color-text)] border-2 border-[var(--color-surface)] shadow-md select-none pointer-events-none ${className}`}
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}