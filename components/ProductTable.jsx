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
}) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [processingProducts, setProcessingProducts] = useState(new Set());
  const [currentAction, setCurrentAction] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const tableRef = useRef(null);

  const productIds = useMemo(() => products.map((p) => p.id), [products]);

  const pagination = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: products.length,
      ...propPagination,
    }),
    [propPagination, products.length]
  );

  const { selectedCount, totalCount, isAllSelected, isIndeterminate } = useMemo(
    () => ({
      selectedCount: selectedProducts.size,
      totalCount: products.length,
      isAllSelected:
        selectedProducts.size > 0 &&
        selectedProducts.size === products.length,
      isIndeterminate:
        selectedProducts.size > 0 &&
        selectedProducts.size < products.length,
    }),
    [selectedProducts.size, products.length]
  );

  const handleSeoClick = useCallback(
    (productId) => {
      const encodedId = encodeURIComponent(productId);
      router.push(`/seo-opportunities/${encodedId}?status=loading`);
    },
    [router]
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
              newSelection.add(productIds[i]);
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

  const toggleSelectAll = useCallback(() => {
    setSelectedProducts((prev) =>
      prev.size === products.length ? new Set() : new Set(productIds)
    );
  }, [productIds, products.length]);

  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
    setLastSelectedId(null);
  }, []);

  // ✅ Handle bulk analyze/resolve with top button + per-row loading
  const handleBulkAction = async (actionType) => {
    if (selectedProducts.size === 0) return;

    const ids = Array.from(selectedProducts);
    setCurrentAction(actionType);
    setProcessingProducts(new Set(ids));

    try {
      if (actionType === "resolve" && onResolve) {
        await onResolve(ids);
      } else if (actionType === "analyze" && onAnalyze) {
        await onAnalyze(ids);
      }
      setSelectedProducts(new Set());
    } catch (error) {
      console.error(`Error in bulk ${actionType}:`, error);
    } finally {
      setProcessingProducts(new Set());
      setCurrentAction(null);
    }
  };

  // ✅ Focus handling for accessibility
  useEffect(() => {
    if (tableRef.current && selectedProducts.size > 0) {
      const focusable = tableRef.current.querySelector("button, [tabindex]");
      if (focusable) focusable.focus();
    }
  }, [selectedProducts.size]);

  // ✅ Loading state
  if (isLoading) return <TableSkeleton rows={5} />;

  // ✅ Empty state
  if (products.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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

  // ✅ Rows rendering
  const productRows = useMemo(
    () =>
      products.map((product) => (
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
            // ✅ Row loading when included in processingProducts
            isProcessing={processingProducts.has(product.id)}
            processingAction={
              processingProducts.has(product.id) ? currentAction : null
            }
          />
        </div>
      )),
    [
      products,
      selectedProducts,
      processingProducts,
      currentAction,
      onView,
      onResolve,
      toggleProductSelection,
      handleSeoClick,
    ]
  );

  return (
    <div className="space-y-6 relative" ref={tableRef}>
      {/* ✅ Floating Bulk Action Bar */}
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

              {/* Analyze Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("analyze")}
                disabled={processingProducts.size > 0}
                className="rounded-full border-blue-200 hover:bg-blue-50 text-blue-700 gap-2"
              >
                {currentAction === "analyze" &&
                processingProducts.size > 0 ? (
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

              {/* Resolve Button */}
              <Button
                size="sm"
                onClick={() => handleBulkAction("resolve")}
                disabled={processingProducts.size > 0}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {currentAction === "resolve" &&
                processingProducts.size > 0 ? (
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
        <AnimatePresence mode="popLayout">{productRows}</AnimatePresence>
      </motion.div>

      {/* ✅ Pagination */}
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
