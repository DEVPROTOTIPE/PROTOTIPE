import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlaceholderVanishInput({
  value = '',
  onChange,
  placeholder = 'Buscar producto...',
  disabled = false
}) {
  const [isFocused, setIsFocused] = useState(false);
  const showPlaceholder = !value && !isFocused;

  const placeholderLetters = placeholder.split('');

  return (
    <div className="relative w-full rounded-xl bg-[var(--color-surface)]">
      <AnimatePresence mode="popLayout">
        {showPlaceholder && (
          <div className="absolute left-4 top-3.5 flex pointer-events-none select-none overflow-hidden z-20">
            {placeholderLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 0.5 }}
                exit={{
                  y: -15,
                  opacity: 0,
                  transition: {
                    duration: 0.25,
                    delay: index * 0.02,
                    ease: "easeOut"
                  }
                }}
                className="text-sm font-medium text-[var(--color-text-muted)]/50 whitespace-pre"
              >
                {char}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition-all duration-200 z-10 relative"
      />
    </div>
  );
}