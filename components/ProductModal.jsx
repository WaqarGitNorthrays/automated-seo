"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProductModal({ product, onClose, isOpen }) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b bg-white/70 backdrop-blur-md rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {product["Product Name"] || product.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed audit of detected SEO & performance issues
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {product.issues && product.issues.length > 0 ? (
                product.issues.map((issue, index) => {
                  const scoreMatch = issue.match(/(\d+)\/(\d+)$/);
                  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                  const maxScore = scoreMatch ? parseInt(scoreMatch[2]) : 10;
                  const percentage = (score / maxScore) * 100;
                  const issueText = issue.split(/\s+\d+\/\d+$/)[0].trim();

                  const color =
                    percentage >= 80
                      ? "bg-green-500"
                      : percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500";

                  const Icon =
                    percentage >= 80 ? CheckCircle2 : AlertCircle;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 border border-gray-200 rounded-xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-5 h-5 ${
                              percentage >= 80
                                ? "text-green-500"
                                : percentage >= 50
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          />
                          <h4 className="text-gray-800 font-medium">
                            {issueText}
                          </h4>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {score}/{maxScore}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className={`h-2.5 ${color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                  <p className="text-gray-700 font-medium">
                    No issues found for this product.
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Everything looks perfectly optimized.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
