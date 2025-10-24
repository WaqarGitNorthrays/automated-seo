"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGSCStore } from "@/store/gscStore";

import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import CircularIndicator from "@/components/CircularIndicator";
import QueryTable from "@/components/QueryTable";
import IssuesList from "@/components/IssuesList";
import ConnectionForm from "@/components/ConnectionForm";

export default function GSCMetrics() {
  const router = useRouter();
  const { 
    websiteUrl,
    isConnected,
    isLoading,
    metrics,
    issues,
    toast,
    connectWebsite,
  } = useGSCStore();

  const handleConnect = async (credentials) => {
    await connectWebsite(credentials.websiteUrl);
  };

  // --- Show connection form when not connected ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar title="Google Search Console" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto py-16 px-6 text-center"
        >
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight">
            Connect Your Website
          </h1>
          <p className="mt-3 text-gray-600 text-base max-w-2xl mx-auto">
            Link your property to Google Search Console and start uncovering
            performance, ranking, and usability insights instantly.
          </p>

          <div className="mt-10">
            <ConnectionForm onConnect={handleConnect} isLoading={isLoading} />
          </div>

          {toast && (
            <div className="mt-4">
              <Toast message={toast.message} type={toast.type} />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // --- Dashboard view when connected ---
  const vitals = metrics?.coreWebVitals || {};

  const parseValue = (val) =>
    val ? parseFloat(String(val).replace(/[^\d.]/g, "")) : null;

  const lcp = parseValue(vitals.lcp);
  const inp = parseValue(vitals.inp);
  const cls = parseValue(vitals.cls);
  const pagespeed = parseValue(vitals.pagespeedscore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar title="Google Search Console" isConnected={isConnected} storeName={websiteUrl} showActions />

      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        {/* Overview Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Website Health & Performance Overview
          </h1>
          <p className="mt-2 text-gray-500">
            Monitor and resolve key technical issues affecting visibility,
            speed, and SEO ranking.
          </p>
        </motion.div>

        {/* --- Core Web Vitals Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Core Web Vitals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 place-items-center">
            <CircularIndicator label="LCP" value={lcp} unit="s" />
            <CircularIndicator label="INP" value={inp} unit="s" />
            <CircularIndicator label="CLS" value={cls} />
            <CircularIndicator label="Speed" value={pagespeed} max={100} />
            {/* <CircularIndicator label="Desktop" value={pagespeed} max={100} /> */}
          </div>

          {/* Indexed Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-5 text-center shadow-sm">
              <h4 className="text-lg font-semibold text-green-800">
                Indexed Pages
              </h4>
              <p className="text-3xl font-extrabold text-green-900 mt-2">
                {metrics?.indexed || 0}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-5 text-center shadow-sm">
              <h4 className="text-lg font-semibold text-rose-800">
                Not Indexed Pages
              </h4>
              <p className="text-3xl font-extrabold text-rose-900 mt-2">
                {metrics?.notIndexed || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- Top Queries Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Performing Queries
          </h3>
          <QueryTable data={metrics?.queries || []} />
        </motion.div>

        {/* --- Website Issues Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Website Issues & Optimization Insights
          </h3>
          <IssuesList issues={issues || []} />
        </motion.div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50">
            <Toast message={toast.message} type={toast.type} />
          </div>
        )}
      </div>
    </div>
  );
}
