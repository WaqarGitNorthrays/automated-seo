"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

export default function ProductRow({
  product,
  isSelected,
  onSelect,
  onView,
  onResolve,
  onSeoClick,
  isProcessing,
  processingAction = null,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const nameRef = useRef(null);

  const getSeoScoreColor = (score) => {
    if (score >= 90)
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getStatusColor = (status) => {
    return status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-visible rounded-2xl border backdrop-blur-md shadow-sm transition-all duration-300 ${
        isSelected
          ? "border-blue-400 ring-2 ring-blue-200/50 bg-gradient-to-r from-white to-blue-50/30 z-20"
          : "border-gray-200 bg-white/70 hover:shadow-md hover:z-10"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 relative">
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-blue-700">
                {processingAction === 'analyze' ? 'Analyzing...' : 'Resolving...'}
              </span>
            </div>
          </div>
        )}
        
        {/* Selection + Image */}
        <div className="flex items-center gap-4 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isProcessing ? 'opacity-50' : ''}`}
            disabled={isProcessing}
          />

          <div className={`w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shadow-inner ${isProcessing ? 'opacity-70' : ''}`}>
            <Package className={`w-7 h-7 ${isProcessing ? 'text-gray-300' : 'text-gray-400'}`} aria-label="Product" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative">
              <h3 
                ref={nameRef}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="font-semibold text-gray-900 text-base truncate tracking-tight max-w-[200px] md:max-w-[300px] lg:max-w-[400px] cursor-default"
              >
                {product.name}
              </h3>
              
              {/* Tooltip */}
              {showTooltip && product.name.length > 40 && nameRef.current && (
                <div 
                  className="absolute z-[9999] p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg whitespace-normal break-words max-w-xs"
                  style={{
                    bottom: '100%',
                    left: '0',
                    marginBottom: '8px'
                  }}
                >
                  {product.name}
                  <div 
                    className="absolute w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"
                    style={{
                      top: '100%',
                      left: '16px',
                      marginTop: '-5px'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getSeoScoreColor(
                  product.seoScore
                )}`}
              >
                SEO Score: {product.seoScore}/100
              </span>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  product.status
                )}`}
              >
                {product.status}
              </span>

              {product.issues && product.issues.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onView}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium p-1 h-6 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {product.issues.length} Issue
                  {product.issues.length !== 1 ? "s" : ""}
                </Button>
              ) : (
                <span className="flex items-center text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  No issues
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-end lg:justify-normal">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onView}
              disabled={isProcessing}
              className="rounded-full px-4 text-gray-700 hover:text-blue-700 hover:border-blue-400"
            >
              Issues
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSeoClick}
              disabled={isProcessing}
              className="rounded-full px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-md hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              SEO
            </Button>
          </div>

          {/* {product.issues && product.issues.length > 0 && (
            <Button
              size="sm"
              onClick={() => onResolve && onResolve(product.id)}
              disabled={isProcessing}
              className={`rounded-full px-4 flex items-center gap-1 font-medium ${
                isSelected
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </>
              )}
            </Button>
          )} */}
        </div>
      </div>

      {/* Subtle bottom gradient hover effect */}
      {/* <motion.div
        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0"
        animate={{ opacity: isSelected ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      /> */}
    </motion.div>
  );
}