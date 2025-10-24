"use client";

import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = "No data available",
  description = "Get started by connecting your store or adding products.",
  action
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl scale-110" />
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-full shadow-inner hover:shadow-md transition-all">
          <Icon className="w-12 h-12 text-blue-500" aria-label={title} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-gray-600 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button (if provided) */}
      {action && (
        <div className="mt-2">
          {typeof action === "function" ? action() : action}
        </div>
      )}
    </motion.div>
  );
}
