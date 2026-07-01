import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-premium-dark rounded-2xl shadow-2xl p-4 border border-gray-100 dark:border-gray-800 max-w-[220px]"
          >
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Need help? Chat with us on WhatsApp!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href="https://wa.me/25078XXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircle className="h-7 w-7" />
      </motion.a>
    </div>
  );
}
