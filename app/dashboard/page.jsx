"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Globe, Activity, BarChart3 } from "lucide-react";

export default function DashboardMain() {
  // Dummy metrics — replace later with dynamic data
  const metrics = [
    {
      label: "Total Clicks",
      value: "25.6K",
      change: "+8.3%",
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Total Impressions",
      value: "98.4K",
      change: "+3.2%",
      icon: Globe,
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      label: "CTR",
      value: "2.9%",
      change: "-0.5%",
      icon: Activity,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Average Position",
      value: "18.4",
      change: "+1.2%",
      icon: BarChart3,
      gradient: "from-orange-500 to-rose-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6 space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            A quick look at your key performance metrics and engagement trends.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-10`}
              />
              <div className="relative p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">
                    {item.label}
                  </div>
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-white shadow-md`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    item.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {item.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Placeholder Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart Placeholder */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Traffic Overview
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Your performance data visualization will appear here.
          </p>
          <div className="h-40 w-full border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Chart Placeholder
          </div>
        </motion.div>

        {/* Engagement Placeholder */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Engagement Insights
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Behavioral metrics and session analytics will be shown here.
          </p>
          <div className="h-40 w-full border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Insights Placeholder
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
