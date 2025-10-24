"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const QueryTable = ({ data = [] }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "clicks",
    direction: "desc",
  });

  const sortedData = useMemo(() => {
    const sortable = [...data];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return (
        <ArrowsUpDownIcon className="w-4 h-4 ml-1 text-gray-400 transition-colors duration-200" />
      );
    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="w-4 h-4 ml-1 text-indigo-600 transition-transform duration-200" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1 text-indigo-600 transition-transform duration-200" />
    );
  };

  const formatNumber = (num) =>
    new Intl.NumberFormat("en-US").format(num || 0);

  const formatPercentage = (val) =>
    typeof val === "number" ? `${val.toFixed(1)}%` : "—";

  const formatPosition = (pos) =>
    typeof pos === "number" ? pos.toFixed(1) : "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] transition-all">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              {[
                { key: "query", label: "Query", align: "left" },
                { key: "clicks", label: "Clicks", align: "right" },
                { key: "ctr", label: "CTR", align: "right" },
                { key: "impressions", label: "Impressions", align: "right" },
                { key: "position", label: "Position", align: "right" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  scope="col"
                  className={`px-6 py-4 font-semibold uppercase text-[11px] tracking-wide cursor-pointer select-none transition-colors duration-200 ${
                    col.align === "right"
                      ? "text-right hover:bg-gray-50"
                      : "text-left hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      col.align === "right" ? "justify-end" : ""
                    }`}
                  >
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <motion.tr
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                      {row.query}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatPercentage(row.ctr)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatNumber(row.impressions)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatPosition(row.position)}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-gray-400 text-sm italic"
                  >
                    No query data available.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryTable;
