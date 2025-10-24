"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 max-w-md ${colors[type]}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" aria-label={type} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
