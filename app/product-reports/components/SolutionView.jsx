"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/store/productStore";
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function SolutionView({ solutions, productName, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: "", isSuccess: false });
  const handleProductSuggestion = useProductStore((state) => state.handleProductSuggestion);

  const handleAction = async (action) => {
    if (!productName || actionTaken) return;
    setIsLoading(true);

    try {
      const result = await handleProductSuggestion(productName, action);
      setModal({
        isOpen: true,
        message: result.message || `Product ${action}d successfully.`,
        isSuccess: result.success,
      });
      if (result.success) {
        setActionTaken(action);
        if (onStatusChange) onStatusChange(action);
      }
    } catch (error) {
      setModal({
        isOpen: true,
        message: error.message || "An error occurred. Please try again.",
        isSuccess: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!solutions) {
    return (
      <div className="text-center py-8 text-gray-500">
        No solutions available for this product. Run the SEO analysis to generate suggestions.
      </div>
    );
  }

  let parsedSolutions = [];
  try {
    parsedSolutions = typeof solutions === "string" ? JSON.parse(solutions) : [];
  } catch {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading solutions. Please try again later.
      </div>
    );
  }

  if (!Array.isArray(parsedSolutions) || parsedSolutions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No valid solutions found for this product.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Solutions */}
      <div className="space-y-4">
        {parsedSolutions.map((item, idx) => (
          <div
            key={idx}
            className="border-l-4 border-indigo-500 pl-5 py-3 bg-indigo-50 rounded-r-lg shadow-sm"
          >
            <h3 className="font-semibold text-gray-900">{item.Issue}</h3>
            <p className="mt-1 text-gray-700">{item.Solution}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction("approve")}
          disabled={isLoading || actionTaken}
          className={`flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
            ${
              actionTaken === "approve"
                ? "bg-green-600 text-white cursor-default"
                : "bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-md shadow-md"
            }
            ${isLoading && "opacity-60 cursor-not-allowed"}
          `}
        >
          {isLoading && !actionTaken ? (
            "Processing..."
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {actionTaken === "approve" ? "Approved" : "Approve"}
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction("reject")}
          disabled={isLoading || actionTaken}
          className={`flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
            ${
              actionTaken === "reject"
                ? "bg-red-600 text-white cursor-default"
                : "bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-md shadow-md"
            }
            ${isLoading && "opacity-60 cursor-not-allowed"}
          `}
        >
          {isLoading && !actionTaken ? (
            "Processing..."
          ) : (
            <>
              <XCircleIcon className="h-5 w-5 mr-2" />
              {actionTaken === "reject" ? "Rejected" : "Reject"}
            </>
          )}
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0   flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center relative"
            >
              <div
                className={`flex flex-col items-center ${
                  modal.isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {modal.isSuccess ? (
                  <CheckCircleIcon className="h-12 w-12 mb-2" />
                ) : (
                  <XCircleIcon className="h-12 w-12 mb-2" />
                )}
                <h3 className="text-xl font-semibold mb-2">
                  {modal.isSuccess ? "Success!" : "Error"}
                </h3>
                <p className="text-gray-700 mb-6">{modal.message}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition-all duration-300"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
