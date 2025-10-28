"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductRow from "./ProductRow";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./Loader";
import { Package, CheckCircle, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import Pagination from "./Pagination";
const memo = require("react").memo;

const ProductTable = memo(function ProductTable({
  products = [],
  isLoading,
  onView,
  onResolve,
  onAnalyze,
  pagination: propPagination = {},
  onPageChange = () => {},
  isProcessing = false,
}) {
  // Always call hooks at the top level and unconditionally
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  
  // Handle SEO click to navigate to SEO opportunities page
  const handleSeoClick = useCallback((productId) => {
    const encodedId = encodeURIComponent(productId);
    router.push(`/seo-opportunities/${encodedId}?status=loading`);
  }, [router]);
  const [processingProducts, setProcessingProducts] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const tableRef = useRef(null);
  
  // Memoize product IDs and pagination
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const pagination = useMemo(() => ({
    currentPage: 1,
    totalPages: 1,
    totalItems: products.length,
    ...propPagination
  }), [propPagination, products.length]);
  
  // Calculate derived state
  const { selectedCount, totalCount, isAllSelected, isIndeterminate } = useMemo(
    () => ({
      selectedCount: selectedProducts.size,
      totalCount: products.length,
      isAllSelected: selectedProducts.size > 0 && selectedProducts.size === products.length,
      isIndeterminate: selectedProducts.size > 0 && selectedProducts.size < products.length,
    }),
    [selectedProducts.size, products.length]
  );
  
  const toggleProductSelection = useCallback(
    (productId, isShiftKey = false) => {
      setSelectedProducts((prev) => {
        const newSelection = new Set(prev);

        if (isShiftKey && lastSelectedId) {
          const lastIndex = productIds.indexOf(lastSelectedId);
          const currentIndex = productIds.indexOf(productId);
          if (lastIndex !== -1 && currentIndex !== -1) {
            const [start, end] = [
              Math.min(lastIndex, currentIndex),
              Math.max(lastIndex, currentIndex),
            ];
            for (let i = start; i <= end; i++) {
              const id = productIds[i];
              newSelection.add(id);
            }
          }
        } else {
          newSelection.has(productId)
            ? newSelection.delete(productId)
            : newSelection.add(productId);
        }
        return newSelection;
      });
      setLastSelectedId(productId);
    },
    [lastSelectedId, productIds]
  );

  ProductTable.displayName = "ProductTable";

  const productRows = useMemo(() => {
    if (!Array.isArray(products)) return null;

    return products.map((product) => (
      <div key={product.id} className="relative group">
        <ProductRow
          product={{
            id: product.id,
            name: product["Product Name"],
            seoScore: product["SEO Score"],
            status: product.status,
            issues: product.issues,
          }}
          isSelected={selectedProducts.has(product.id)}
          onSelect={(e) => toggleProductSelection(product.id, e.shiftKey)}
          onView={() => onView(product)}
          onResolve={onResolve}
          onSeoClick={() => handleSeoClick(product.id)}
          isProcessing={processingProducts.has(product.id)}
          processingAction={
            processingProducts.has(product.id) ? currentAction : null
          }
        />
      </div>
    ));
  }, [products, selectedProducts, processingProducts, currentAction, onView, onResolve, toggleProductSelection, handleSeoClick]);
  ProductTable.displayName = "ProductTable";

  useEffect(() => {
    if (tableRef.current && selectedProducts.size > 0) {
      const focusable = tableRef.current.querySelector("button, [tabindex]");
      if (focusable) focusable.focus();
    }
  }, [selectedProducts.size]);

  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(productIds));
    }
  }, [products.length, selectedProducts.size, productIds]);

  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
    setLastSelectedId(null);
  }, []);

  const handleBulkAction = async (actionType) => {
    if (selectedProducts.size === 0) return;

    const productIds = Array.from(selectedProducts);
    setCurrentAction(actionType);
    setProcessingProducts(new Set(productIds));

    try {
      if (actionType === "resolve") {
        await onResolve(productIds);
      } else if (onAnalyze) {
        await onAnalyze(productIds);
      }
      setSelectedProducts(new Set());
    } catch (error) {
      console.error(`Error in bulk ${actionType}:`, error);
    } finally {
      setProcessingProducts(new Set());
      setCurrentAction(null);
    }
  };

  // Show loading state
  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
          aria-label="No products found"
        >
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your filters or connect your store to get started."
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-6 relative" ref={tableRef}>
      {/* ✅ Floating Selection Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="sticky top-2 z-20 bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-lg p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700 cursor-pointer">
                {selectedCount} selected of {totalCount}
              </label>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("analyze")}
                disabled={processingProducts.size > 0}
                className="rounded-full border-blue-200 hover:bg-blue-50 text-blue-700 gap-2"
              >
                {currentAction === "analyze" && processingProducts.size > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze {selectedCount}</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={() => handleBulkAction("resolve")}
                disabled={processingProducts.size > 0}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {currentAction === "resolve" && processingProducts.size > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resolving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve {selectedCount}</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Product Rows */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-5 sm:gap-6"
        layout
        transition={{ layout: { duration: 0.3 } }}
      >
        <AnimatePresence mode="popLayout">
          {productRows}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
});

export default ProductTable;
