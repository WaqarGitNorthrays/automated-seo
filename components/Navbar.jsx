"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Store, RefreshCw, CheckCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Navbar({
  title = "Dashboard",
  storeName,
  isConnected = false,
  isAnalyzing = false,
  isResolving = false,
  onConnect,
  onReconnect,
  onAnalyzeAll,
  onResolveAll,
  showActions = false,
}) {
  const [hasCachedStore, setHasCachedStore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // 🚫 Disable analyze/resolve buttons only on GSC Metrics
  const isGscMetricsPage = pathname === "/gsc-metrics";

  // useEffect(() => {

  //   if (typeof window !== 'undefined') {
  //     setMounted(true);
  //     const storeInfo = localStorage.getItem("storeInfo");
  //     const accessToken = localStorage.getItem("accessToken");

  //     if (storeInfo && accessToken) {
  //       setHasCachedStore(true);
  //       const parsedStore = JSON.parse(storeInfo);

  //       if (!isConnected && parsedStore.isConnected) {
  //         setTimeout(() => {
  //           onReconnect?.(parsedStore.name, accessToken);
  //         }, 500);
  //       }
  //     }
  //   }
  // }, [isConnected, onReconnect]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return <div className="h-20 w-full" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-gray-100 shadow-[0_1px_10px_rgba(0,0,0,0.03)]"
    >
      <div className="pl-16 lg:pl-6 pr-6 py-4 lg:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* 🧭 Title + Store Info */}
        <div>
          <motion.h2
            layoutId="navbar-title"
            className="text-2xl font-semibold text-gray-900 tracking-tight"
          >
            {title}
          </motion.h2>

          {storeName && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Store className="w-4 h-4" />
                <span className="text-sm font-medium">{storeName}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full border transition-all duration-300 ${
                  isConnected
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          )}
        </div>

        {/* ⚙️ Actions */}
        {showActions && !isGscMetricsPage && (
          <div className="flex flex-wrap items-center gap-3">
            {/* 🔌 Disconnected State */}
            {/* {!isConnected && (
              <>
                <Button
                  onClick={onConnect}
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                >
                  <Store className="w-4 h-4" />
                  Connect Store
                </Button>

                {hasCachedStore && (
                  <div className="inline-block">
                    <Button
                      onClick={() => {
                        const storeInfo = JSON.parse(localStorage.getItem("storeInfo"));
                        const accessToken = localStorage.getItem("accessToken");
                        onReconnect?.(storeInfo?.name, accessToken);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                      <Link2 className="w-4 h-4" />
                      Reconnect Store
                    </Button>
                  </div>
                )}
              </>
            )} */}

            {/* ✅ Connected State */}
            {isConnected && (
              <>
                <div className="inline-block">
                  <Button
                    onClick={onAnalyzeAll}
                    variant="outline"
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:text-blue-700 transition-all hover:scale-[1.02]"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isAnalyzing ? "animate-spin text-blue-600" : ""
                      }`}
                    />
                    {isAnalyzing ? "Analyzing..." : "Analyze All"}
                  </Button>
                </div>

                <div className="inline-block">
                  <Button
                    onClick={onResolveAll}
                    disabled={isResolving}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-md shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isResolving ? "Resolving..." : "Resolve All"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}