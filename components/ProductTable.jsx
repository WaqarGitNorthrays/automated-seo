"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductRow from "./ProductRow";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./Loader";
import { Package, CheckCircle, Loader2, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export default function ProductTable({
  products,
  isLoading,
  onView,
  onResolve,
  onAnalyze,
  isProcessing,
}) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [processingProducts, setProcessingProducts] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  // ✅ Select / Deselect single product
  const toggleProductSelection = useCallback(
    (productId, isShiftKey = false) => {
      setSelectedProducts((prev) => {
        const newSelection = new Set(prev);
        const productIds = products.map((p) => p.id);

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
    [lastSelectedId, products]
  );

  // ✅ Select/Deselect All
  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  }, [products, selectedProducts.size]);

  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
    setLastSelectedId(null);
  }, []);

  // ✅ Bulk Analyze / Resolve
  const handleBulkAction = async (actionType) => {
    if (selectedProducts.size === 0) return;

    const actionText =
      actionType === "resolve" ? "resolve issues for" : "analyze";
    // const confirmed = window.confirm(
    //   `Do you want to ${actionText} ${selectedProducts.size} selected product${
    //     selectedProducts.size > 1 ? "s" : ""
    //   }?`
    // );

    // if (!confirmed) return;

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

  // ✅ Loading State
  if (isLoading) return <TableSkeleton rows={5} />;

  // ✅ Empty State
  if (!products || products.length === 0)
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="Connect your Shopify store to begin analyzing products for SEO opportunities."
            action={
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
                Connect Store
              </button>
            }
          />
        </motion.div>
      </AnimatePresence>
    );

  // ✅ Derived Selection State
  const selectedCount = selectedProducts.size;
  const totalCount = products.length;
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="space-y-6 relative">
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
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedCount} selected of {totalCount}
              </span>
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
                className="rounded-full border-gray-300"
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
                    Analyzing {processingProducts.size}...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze {selectedCount}
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
                    Resolving {processingProducts.size}...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Resolve {selectedCount}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Product List */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-5 sm:gap-6"
        transition={{ layout: { duration: 0.3 } }}
      >
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
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
                onSeoClick={() => {
                  const encodedId = encodeURIComponent(product.id);
                  router.push(`/seo-opportunities/${encodedId}?status=loading`);
                }}
                isProcessing={processingProducts.has(product.id)}
                processingAction={
                  processingProducts.has(product.id) ? currentAction : null
                }
              />
            </div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
