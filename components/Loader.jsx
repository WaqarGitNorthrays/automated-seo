"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function FullPageLoader({ message = "Loading...", currentProduct }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" aria-label="Loading" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{message}</h3>
          {currentProduct && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              Currently processing: <span className="font-medium">{currentProduct}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
