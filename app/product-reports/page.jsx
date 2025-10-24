"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import AnalysisView from "./components/AnalysisView";
import SolutionView from "./components/SolutionView";
import ProductCard from "./components/ProductCard";

export default function ProductReportsPage() {
  const { products, fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [filters, setFilters] = useState({
    hasResolution: 'all', // 'all', 'with', 'without'
    scoreRange: 'all',    // 'all', 'high', 'medium', 'low'
    status: 'all'         // 'all', 'active', 'draft', 'archived'
  });
  const router = useRouter();

  const getStatusColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const filteredProducts = products.filter(product => {
    // Filter by resolution status
    if (filters.hasResolution === 'with' && !product.issues_and_proposed_solutions) return false;
    if (filters.hasResolution === 'without' && product.issues_and_proposed_solutions) return false;
    
    // Filter by score range
    if (filters.scoreRange !== 'all') {
      const scoreLevel = getScoreLevel(product['SEO Score']);
      if (filters.scoreRange !== scoreLevel) return false;
    }
    
    // Filter by status
    if (filters.status !== 'all' && product.status !== filters.status.toUpperCase()) {
      return false;
    }
    
    return true;
  });

//   const getStatusIcon = (score) => {
//     if (score >= 80) return 'score';
//     if (score >= 60) return 'score';
//     return 'score';
//   };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storeInfo = JSON.parse(localStorage.getItem("storeInfo") || '{}');
        const accessToken = localStorage.getItem("accessToken");
        
        if (storeInfo?.name && accessToken) {
          await fetchProducts(storeInfo.name, accessToken);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts]);

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

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No products found</h2>
          <p className="text-gray-600 mb-4">Connect your store to view product reports</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleViewReport = (product) => {
    setSelectedProduct(product);
    setShowReport(true);
  };

  const handleBackToList = () => {
    setShowReport(false);
    setSelectedProduct(null);
  };

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
                  {selectedProduct['Product Name']}
                </h1>
                <div className="mt-2 flex items-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProduct['SEO Score'])}`}>
                    <span className="ml-1">SEO Score: {selectedProduct['SEO Score']}%</span>
                  </div>
                  <span className="ml-3 text-sm text-gray-500">
                    Status: <span className="font-medium">{selectedProduct.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedProduct.issues_and_proposed_solutions ? 'Resolution Report' : 'SEO Analysis'}
            </h2>
            
            {selectedProduct.issues_and_proposed_solutions ? (
              <SolutionView 
                solutions={selectedProduct.issues_and_proposed_solutions} 
                productName={selectedProduct['Product Name']}
                onStatusChange={(action) => {
                  // Update the local state to reflect the change
                  const updatedProducts = products.map(p => 
                    p.id === selectedProduct.id 
                      ? { ...p, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
                      : p
                  );
                  // Update the store with the new status
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
              {products.filter(p => p.issues_and_proposed_solutions).length} with solutions
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Status</label>
              <select
                value={filters.hasResolution}
                onChange={(e) => setFilters({...filters, hasResolution: e.target.value})}
                className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Products</option>
                <option value="with">With Solutions</option>
                <option value="without">Needs Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Score</label>
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters({...filters, scoreRange: e.target.value})}
                className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80-100)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (0-59)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onViewReport={handleViewReport}
            getStatusColor={getStatusColor}
            // getStatusIcon={getStatusIcon}
          />
        ))}
      </div>
    </div>
  );
}
