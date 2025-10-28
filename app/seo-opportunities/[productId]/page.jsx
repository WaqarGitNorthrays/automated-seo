"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";

export default function SEOOpportunitiesPage() {
  const { productId } = useParams();
  const decodedId = decodeURIComponent(productId);
  const { analyzeSEOOpportunities, showToast, products } = useProductStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const product = products.find((p) => p.id === decodedId);
  const productName = product?.["Product Name"] || "this product";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await analyzeSEOOpportunities(decodedId);
        if (response) setData(response);
        else setError("No response received from AI.");
      } catch (err) {
        console.error("SEO analysis error:", err);
        showToast("Failed to analyze SEO opportunities.", "error");
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [decodedId, analyzeSEOOpportunities, showToast]);

  // ====== Loading UI ======
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 px-6 text-center space-y-4">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <h2 className="text-xl font-semibold text-gray-900">
          Generating SEO insights for <span className="text-blue-600">{productName}</span>
        </h2>
        <p className="text-gray-500 max-w-md">
          Our AI is analyzing your product to find the best SEO opportunities. This may take a few
          seconds. ✨
        </p>
      </div>
    );

  // ====== Error UI ======
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );

  // ====== No Opportunities ======
  if (!data || !data.opportunities?.length) {
    const message = data?.message || `No SEO opportunities found for ${productName}.`;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{message}</h2>
        <Link
          href="/product-issues"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  // ====== Main Content ======
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 py-12 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
            SEO Opportunities for <span className="text-blue-600">{productName}</span>
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          AI-curated improvements to boost your product's organic reach, rankings, and user
          engagement.
        </p>
      </div>

      {/* Opportunities Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.opportunities.map((item, index) => {
          const isQuickWin = item.opportunity?.toLowerCase().includes("quick win");
          const isLowPriority = item.opportunity?.toLowerCase().includes("low priority");
          const badgeColor = isQuickWin
            ? "bg-blue-100 text-blue-700"
            : isLowPriority
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-700";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-400 p-8 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 leading-snug">{item.opportunity}</h3>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${badgeColor}`}
                >
                  {isQuickWin ? "Quick Win" : isLowPriority ? "Low Priority" : `#${index + 1}`}
                </span>
              </div>

              {/* Actions */}
              <p className="text-[15px] leading-7 text-gray-700">{item.proposed_actions}</p>

              {/* Article */}
              {item.article_html && (
                <div
                  className="prose prose-sm max-w-none border-t border-gray-100 pt-4 mt-2 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: item.article_html }}
                />
              )}

              {/* Description */}
              {item.new_description_html && (
                <div
                  className="prose prose-sm max-w-none border-t border-gray-100 pt-4 mt-2 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: item.new_description_html }}
                />
              )}

              {/* Meta info */}
              {(item.new_meta_title || item.new_meta_description) && (
                <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {item.new_meta_title && (
                    <p className="text-sm text-gray-800">
                      <b>Meta Title:</b> {item.new_meta_title}
                    </p>
                  )}
                  {item.new_meta_description && (
                    <p className="text-sm text-gray-800 mt-1">
                      <b>Meta Description:</b> {item.new_meta_description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
