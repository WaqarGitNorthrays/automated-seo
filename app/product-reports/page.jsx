"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import AnalysisView from "./components/AnalysisView";
import SolutionView from "./components/SolutionView";
import ProductCard from "./components/ProductCard";
import Pagination from "@/components/Pagination";
import ProductFilters from "@/components/filters/ProductFilters";
import parseSolutions from "@/utils/parseSolutions";
import Navbar from "@/components/Navbar";
import {Button} from "../../components/ui/button.tsx";


export default function ProductReportsPage() {
  const { products, fetchProductsForReports, reportsPagination } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("analysis");
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState({
    active: true,
    optimized: null,
    analyzed: null,
    score_min: null,
    score_max: null,
  });

  // ---------- Helpers ----------
  const getStatusColor = (score) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const getLocalData = () => {
    const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    return { storeInfo, accessToken, email };
  };

  const processFilters = (filters) => ({
    ...filters,
    active: filters.active !== null ? Boolean(filters.active) : null,
    optimized: filters.optimized !== null ? Boolean(filters.optimized) : null,
    analyzed: filters.analyzed !== null ? Boolean(filters.analyzed) : null,
    // analyzed: true,
    ...(filters.score_min !== null && { score_min: Number(filters.score_min) }),
    ...(filters.score_max !== null && { score_max: Number(filters.score_max) }),
  });

  // ---------- Data Fetch ----------
  const loadProducts = async (page = 1, newFilters = filters) => {
    const { storeInfo, accessToken, email } = getLocalData();
    if (!storeInfo?.name || !accessToken) return;

    setLoading(true);
    try {
      await fetchProductsForReports(page, false, { 
        ...newFilters, 
        analyzed: true 
      });
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Event Handlers ----------
  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    loadProducts(1, updated);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      active: true,
      optimized: null,
      analyzed: null,
      score_min: null,
      score_max: null,
    };
    setFilters(defaultFilters);
    loadProducts(1, defaultFilters);
  };

  const handlePageChange = (newPage) => loadProducts(newPage);

  const handleViewReport = (product, mode = "analysis") => {
    setSelectedProduct(product);
    setViewMode(mode);
    setShowReport(true);
  };

  const handleBackToList = () => {
    setShowReport(false);
    setSelectedProduct(null);
  };

  const isStoreConnected = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const storeInfo = localStorage.getItem("storeInfo");
    const accessToken = localStorage.getItem("accessToken");
    return !!(storeInfo && accessToken);
  }, []);

  // Check store connection first
  if (!isStoreConnected) {
    return (
      <>
      <Navbar title = "Product Reports" />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No store connected. Please connect your store to view product reports.
                </p>
              </div>
            </div>
          </div>
            <Link
              href="/product-issues"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Products
            </Link>
        </div>
      </div>
      </>
    );
  }

  // Show loading only when there's an actual data fetch happening
  if (loading && products.length === 0) {
    return (
      <>
      <Navbar title = "Product Reports" />
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
      </>
    );
  }

  // ---------- Report View ----------
  if (showReport && selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBackToList}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 transform rotate-180 mr-1" />
          Back to Products
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedProduct["Product Name"]}
            </h1>
            <div className="mt-2 flex items-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  selectedProduct["SEO Score"]
                )}`}
              >
                SEO Score: {selectedProduct["SEO Score"]}%
              </div>
            </div>
          </div>

          <div className="p-6">
            {viewMode === "analysis" ? (
              <AnalysisView product={selectedProduct} />
            ) : (
              <SolutionView
                solutions={parseSolutions(selectedProduct.issues_and_proposed_solutions)}
                productName={selectedProduct["Product Name"]}
              />
            )}

            {selectedProduct.issues_and_proposed_solutions && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() =>
                    setViewMode(
                      viewMode === "analysis" ? "solution" : "analysis"
                    )
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View {viewMode === "analysis" ? "Solution" : "Analysis"}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Main Page ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
            <Navbar
              title="Product Reports"
            />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8">
          <ProductFilters
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            initialFilters={filters}
            hideAnalyzed={true}
          />
        </div>

        {/* No Products */}
        {(!products || products.length === 0) && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {isStoreConnected
                ? "No products match the current filters. Try adjusting your search criteria."
                : "Connect your store to view product reports."}
            </p>
            <div className="mt-6">
              {isStoreConnected ? (
                <Button
                  onClick={handleResetFilters}
                  variant="link"
                 >
                </Button>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Connect Store
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewReport={handleViewReport}
                statusColor={getStatusColor(product["SEO Score"])}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {reportsPagination?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={reportsPagination.currentPage}
              totalPages={reportsPagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
