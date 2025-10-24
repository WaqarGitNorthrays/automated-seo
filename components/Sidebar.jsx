"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Package,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Product Issues", href: "/product-issues", icon: Package },
  { name: "Reports", href: "/product-reports", icon: FileText },
  { name: "GSC Metrics", href: "/gsc-metrics", icon: BarChart3 },
  { name: "How to Use", href: "/how-to-use", icon: HelpCircle },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 🌐 Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md transition hover:shadow-lg hover:scale-105"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* 🌟 Sidebar Panel */}
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-2xl border-r border-gray-100 shadow-[4px_0_15px_-4px_rgba(0,0,0,0.05)] flex flex-col ${
              isOpen ? "block" : "hidden lg:flex"
            }`}
          >
            {/* 🪄 Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-1">
                  SEO Pilot
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </h1>
                <p className="text-xs text-gray-500 mt-1">AI-Powered SEO Suite</p>
              </div>
            </div>

            {/* 🧭 Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-100 shadow-sm"
                          : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-5 h-5 ${
                          isActive ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-label={item.name} />
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* ⚙️ Footer */}
            <div className="p-5 border-t border-gray-100 mt-auto bg-gradient-to-t from-gray-50/80 to-transparent backdrop-blur-sm">
              <div className="rounded-xl bg-white/70 border border-gray-100 px-4 py-3 shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-xs text-gray-500 mb-1">Version</p>
                <p className="text-sm font-medium text-gray-900">1.0.0</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🖤 Overlay for Mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
        />
      )}
    </>
  );
}