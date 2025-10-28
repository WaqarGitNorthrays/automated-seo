"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/store/productStore";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import ProductModal from "@/components/ProductModal";
import ConnectStoreDialog from "@/components/ConnectStoreDialog";
import { Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import ProductFilters from "@/components/filters/ProductFilters";

export default function ProductIssues() {
  const {
    products,
    fetchProductsForReports,
    storeInfo,
    reportsPagination,
    isAnalyzing,
    analyzeProducts,
    isResolving,
    resolveProducts: resolveSingle,
    analyzeAll,
    resolveAll,
    disconnect,
    reconnect,
    isLoading,
    toast,
    showToast,
    updateFilters,
    isProcessingSingle = { analyzing: new Set(), resolving: new Set() },
  } = useProductStore();

  // Local UI state
  const [filters, setFilters] = useState({
    optimized: null,
    active: true,
    analyzed: null,
    score_min: null,
    score_max: null,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);



// ✅ Simplified connectStore — no need to call fetchProductsForReports manually
const connectStore = async ({ storeName, accessToken, email }) => {
  setIsProcessing(true);
  try {
    // Connect store and automatically fetch products (handled inside store)
    await useProductStore.getState().connectStore({
      storeName,
      accessToken,
      email,
    });

    // ✅ Close dialog after success
    setShowConnectDialog(false);
  } catch (error) {
    console.error("Error connecting store:", error);
    showToast({
      type: "error",
      message: "Failed to connect store. Please try again.",
    });
  } finally {
    setIsProcessing(false);
  }
};



  // ✅ Simplified pagination handler
  const handlePageChange = async (newPage) => {
    const pageNumber = newPage && !isNaN(Number(newPage)) ? Number(newPage) : 1;
    await fetchProductsForReports(pageNumber, false, filters);
  };

  // ✅ Simplified filter change handler
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateFilters(newFilters);
    fetchProductsForReports(1, false, newFilters);
  };

  // ✅ Simplified reset filters
  const handleResetFilters = (resetFilters) => {
    setFilters(resetFilters);
    updateFilters(resetFilters);
    fetchProductsForReports(1, false, resetFilters);
  };

  // ✅ Auto reconnect from localStorage
  useEffect(() => {
    const initializeStore = async () => {
      const storedStore = localStorage.getItem("storeInfo");
      const accessToken = localStorage.getItem("accessToken");
      if (storedStore && accessToken) {
        try {
          const parsedStore = JSON.parse(storedStore);
          if (parsedStore.isConnected) {
            await reconnect(parsedStore.name, accessToken);
            await fetchProductsForReports(1);
          }
        } catch (error) {
          console.error("Error auto-loading store:", error);
        }
      }
    };
    initializeStore();
  }, [reconnect, fetchProductsForReports]);

  const isProcessingDerived = isAnalyzing || isResolving || isProcessing;
  const isStoreConnected = storeInfo?.isConnected;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f9fafc] via-[#f5f7fa] to-[#eef1f5] text-gray-900 overflow-hidden">
      {/* ✨ Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[40%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="absolute bottom-[-300px] right-[30%] h-[500px] w-[500px] rounded-full bg-purple-200/20 blur-3xl"></div>
      </div>

      {/* 🧭 Navbar */}
      <Navbar
        title="Product Dashboard"
        storeName={storeInfo.name}
        isConnected={storeInfo.isConnected}
        isAnalyzing={isAnalyzing}
        isResolving={isResolving}
        processingSingle={isProcessingSingle}
        onConnect={() => setShowConnectDialog(true)}
        onReconnect={reconnect}
        onAnalyzeAll={analyzeAll}
        onResolveAll={resolveAll}
        showActions
      />

      {/* ⚙️ Content area */}
      <main className="relative z-10 container mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="mb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Website Health Overview
          </motion.h1>
          <p className="mt-2 text-gray-500 text-sm">
            Monitor your products, analyze SEO, and resolve issues effortlessly.
          </p>
        </div>

        {/* Product Filters */}
        {isStoreConnected && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {showFilters && (
              <ProductFilters
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            )}
          </div>
        )}

        {/* 🩺 Conditional states */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-80 flex-col items-center justify-center text-gray-500"
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p>Loading your products…</p>
            </motion.div>
          ) : !isStoreConnected ? (
            <motion.div
              key="not-connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 py-20 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 mb-4">
                <WifiOff className="h-6 w-6 text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                No Store Connected
              </h2>
              <p className="text-gray-500 text-sm max-w-xs mb-6">
                Connect your Shopify store to begin automatic product analysis and SEO monitoring.
              </p>
              <Button onClick={() => setShowConnectDialog(true)} variant="ghost">
                Connect Store
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ProductTable
                products={products}
                isLoading={isLoading}
                isProcessing={isProcessingDerived}
                onView={setSelectedProduct}
                onResolve={resolveSingle}
                onAnalyze={analyzeProducts}
                onPageChange={handlePageChange}
                pagination={reportsPagination}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🧩 Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isOpen={!!selectedProduct}
      />

      {/* 🏪 Connect Store Dialog */}
      {showConnectDialog && (
        <ConnectStoreDialog
          onClose={() => setShowConnectDialog(false)}
          onConnect={connectStore}
        />
      )}

      {/* 🔔 Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-0 right-6 z-50 mt-4 rounded-lg px-5 py-3 shadow-xl backdrop-blur-md transition-all ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡ Disconnect Button */}
      {isStoreConnected && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={disconnect}
          className="fixed bottom-6 left-6 z-40 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 shadow-sm"
        >
          Disconnect
        </motion.button>
      )}
    </div>
  );
}
