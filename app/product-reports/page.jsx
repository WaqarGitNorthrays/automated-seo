"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { Loader2, ArrowRight } from "lucide-react";
import AnalysisView from "./components/AnalysisView";
import SolutionView from "./components/SolutionView";
import ProductCard from "./components/ProductCard";
import Pagination from "@/components/Pagination";
import ProductFilters from "@/components/filters/ProductFilters";

export default function ProductReportsPage() {
  const { products, fetchProductsForReports, reportsPagination } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [filters, setFilters] = useState({
    active: true, // Default to showing active products
    optimized: null,
    analyzed: null,
    score_min: null,
    score_max: null
  });

  const getStatusColor = (score) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const handlePageChange = async (newPage) => {
    const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");

    if (storeInfo?.name && accessToken) {
      setLoading(true);
      try {
        // Process filters for the API
        const processedFilters = {
          ...filters,
          active: filters.active !== null ? Boolean(filters.active) : null,
          optimized: filters.optimized !== null ? Boolean(filters.optimized) : null,
          analyzed: filters.analyzed !== null ? Boolean(filters.analyzed) : null,
          ...(filters.score_min !== null && { score_min: Number(filters.score_min) }),
          ...(filters.score_max !== null && { score_max: Number(filters.score_max) })
        };
        
        await fetchProductsForReports(
          storeInfo.name, 
          accessToken, 
          newPage, 
          email, 
          false, 
          processedFilters
        );
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Load initial data with default filters
    const loadInitialData = async () => {
      const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
      const accessToken = localStorage.getItem("accessToken");
      const email = localStorage.getItem("email");

      if (storeInfo?.name && accessToken) {
        setLoading(true);
        try {
          const defaultFilters = {
            active: true, // Default to showing only active products
            optimized: null,
            analyzed: null,
            score_min: null,
            score_max: null
          };
          
          setFilters(defaultFilters);
          
          await fetchProductsForReports(
            storeInfo.name,
            accessToken,
            1,
            email,
            false,
            defaultFilters
          );
        } catch (error) {
          console.error("Error loading products:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Process filters for the API
    const processedFilters = {
      ...newFilters,
      active: newFilters.active !== null ? Boolean(newFilters.active) : null,
      optimized: newFilters.optimized !== null ? Boolean(newFilters.optimized) : null,
      analyzed: newFilters.analyzed !== null ? Boolean(newFilters.analyzed) : null,
      ...(newFilters.score_min !== null && { score_min: Number(newFilters.score_min) }),
      ...(newFilters.score_max !== null && { score_max: Number(newFilters.score_max) })
    };
    
    // Update filters in the store
    const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    
    if (storeInfo?.name && accessToken) {
      fetchProductsForReports(
        storeInfo.name,
        accessToken,
        1, // Reset to first page when filters change
        email,
        false,
        processedFilters
      );
    }
  };

  const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
  const accessToken = localStorage.getItem("accessToken");
  const isStoreConnected = storeInfo?.name && accessToken;

  const handleViewReport = (product) => {
    setSelectedProduct(product);
    setShowReport(true);
  };

  const handleBackToList = () => {
    setShowReport(false);
    setSelectedProduct(null);
  };

  // If we're showing a report, render the report view
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProduct["Product Name"]}
                </h1>
                <div className="mt-2 flex items-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedProduct["SEO Score"]
                    )}`}
                  >
                    <span className="ml-1">
                      SEO Score: {selectedProduct["SEO Score"]}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <AnalysisView product={selectedProduct} />
            {selectedProduct.issues_and_proposed_solutions && (
              <div className="mt-8">
                <SolutionView product={selectedProduct} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main page content with header and filters
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Product Reports</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {products?.length || 0} {products?.length === 1 ? 'product' : 'products'} found
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8">
          <ProductFilters 
            onFilterChange={handleFilterChange}
            onReset={handleFilterChange}
            initialFilters={filters}
          />
        </div>

        {/* No results message */}
        {(!products || products.length === 0) && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {isStoreConnected 
                ? 'No products match the current filters. Try adjusting your search criteria.'
                : 'Connect your store to view product reports'}
            </p>
            {isStoreConnected ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleFilterChange({
                    active: null,
                    optimized: null,
                    analyzed: null,
                    score_min: 0,
                    score_max: 100
                  })}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Connect Store
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Products grid */}
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
        {reportsPagination.totalPages > 1 && (
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProduct["Product Name"]}
                </h1>
                <div className="mt-2 flex items-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedProduct["SEO Score"]
                    )}`}
                  >
                    <span className="ml-1">
                      SEO Score: {selectedProduct["SEO Score"]}%
                    </span>
                  </div>
                  <span className="ml-3 text-sm text-gray-500">
                    Status:{" "}
                    <span className="font-medium">{selectedProduct.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedProduct.issues_and_proposed_solutions
                ? "Resolution Report"
                : "SEO Analysis"}
            </h2>

            {selectedProduct.issues_and_proposed_solutions ? (
              <SolutionView
                solutions={selectedProduct.issues_and_proposed_solutions}
                productName={selectedProduct["Product Name"]}
                onStatusChange={(action) => {
                  const updatedProducts = products.map((p) =>
                    p.id === selectedProduct.id
                      ? {
                          ...p,
                          status: action === "approve" ? "APPROVED" : "REJECTED",
                        }
                      : p
                  );
                  useProductStore.setState({ products: updatedProducts });
                }}
              />
            ) : (
              <AnalysisView issues={selectedProduct.issues} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Reports</h1>
            <p className="text-gray-600">View and analyze your product performance</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
            <span className="text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              {products.filter((p) => p.issues_and_proposed_solutions).length} with
              solutions
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters 
            initialFilters={{
              active: filters.active,
              optimized: filters.optimized,
              analyzed: filters.analyzed,
              score_min: filters.score_min,
              score_max: filters.score_max
            }}
            onFilterChange={(newFilters) => {
              setFilters({
                ...filters,
                ...newFilters
              });
              
              // Apply filters immediately
              const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
              const accessToken = localStorage.getItem("accessToken");
              const email = localStorage.getItem("email");
              
              if (storeInfo?.name && accessToken) {
                const apiFilters = {
                  active: newFilters.active !== null ? Boolean(newFilters.active) : null,
                  optimized: newFilters.optimized !== null ? Boolean(newFilters.optimized) : null,
                  analyzed: newFilters.analyzed !== null ? Boolean(newFilters.analyzed) : null,
                  score_min: newFilters.score_min !== null ? Number(newFilters.score_min) : 0,
                  score_max: newFilters.score_max !== null ? Number(newFilters.score_max) : 100
                };
                
                fetchProductsForReports(
                  storeInfo.name,
                  accessToken,
                  1, // Reset to first page when filters change
                  email,
                  false,
                  apiFilters
                );
              }
            }}
            onReset={(resetFilters) => {
              setFilters({
                ...filters,
                active: true,
                optimized: null,
                analyzed: null,
                score_min: 0,
                score_max: 100
              });
              
              // Apply reset filters
              const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
              const accessToken = localStorage.getItem("accessToken");
              const email = localStorage.getItem("email");
              
              if (storeInfo?.name && accessToken) {
                fetchProductsForReports(
                  storeInfo.name,
                  accessToken,
                  1, // Reset to first page
                  email,
                  false,
                  {
                    active: true,
                    optimized: null,
                    analyzed: null,
                    score_min: 0,
                    score_max: 100
                  }
                );
              }
            }}
          />
          
          {/* Additional client-side filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter: Resolution Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Status
              </label>
              <select
                value={filters.hasResolution}
                onChange={(e) =>
                  setFilters({ ...filters, hasResolution: e.target.value })
                }
                className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Products</option>
                <option value="with">With Solutions</option>
                <option value="without">Needs Analysis</option>
              </select>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index}
              onViewReport={handleViewReport} 
              getStatusColor={getStatusColor}
            />
          ))}
        </div>

        {/* Pagination */}
        {reportsPagination && reportsPagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between px-4 py-3">
            <div className="w-full">
              <Pagination
                currentPage={reportsPagination.currentPage}
                totalPages={reportsPagination.totalPages}
                totalItems={reportsPagination.totalItems}
                itemsPerPage={reportsPagination.itemsPerPage}
                onPageChange={handlePageChange}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
