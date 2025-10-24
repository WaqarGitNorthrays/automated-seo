"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Store, Search, CheckCircle, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowToUse() {
  const router = useRouter();

  const sections = [
    {
      title: "Connecting Your Shopify Store",
      icon: Store,
      color: "from-blue-500 to-indigo-500",
      steps: [
        "Go to your dashboard from the sidebar.",
        "Click 'Connect Store' on the top navigation bar.",
        "Enter your Shopify store name (e.g., mystore.myshopify.com).",
        "Provide your Shopify access token under Apps > Develop apps > API credentials.",
        "Click 'Connect' — your products will automatically sync."
      ]
    },
    {
      title: "Analyzing Products for SEO",
      icon: Search,
      color: "from-green-500 to-emerald-500",
      steps: [
        "Once connected, your products will appear in the product list.",
        "Click 'Analyze' beside any product to inspect it individually.",
        "Click 'Analyze All' to review every product at once.",
        "The AI scans titles, descriptions, tags, and images for SEO optimization.",
        "You’ll see a score (0–100) and suggestions for improvement."
      ]
    },
    {
      title: "Resolving SEO Issues",
      icon: CheckCircle,
      color: "from-orange-500 to-amber-500",
      steps: [
        "Products with issues display an issue count badge.",
        "Click 'View' to explore detailed insights per issue.",
        "Use 'Resolve Issues' to auto-fix a single product’s SEO.",
        "Click 'Resolve All' to optimize your entire store at once.",
        "Resolved items will show a green ‘Resolved’ badge."
      ]
    },
    {
      title: "Using GSC Metrics",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
      steps: [
        "Select 'GSC Metrics' in the sidebar.",
        "Monitor clicks, impressions, CTR, and average position.",
        "Explore performance trends with interactive charts.",
        "Inspect issues with severity levels and affected pages.",
        "Apply insights to improve organic search performance."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar title="How to Use" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-3"
          >
            Getting Started with SEO Expert Dashboard
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-3xl"
          >
            Learn how to connect your Shopify store, analyze products, and optimize your SEO workflow — beautifully simplified.
          </motion.p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>

                {/* Steps */}
                <div className="p-6">
                  <ol className="space-y-4">
                    {section.steps.map((step, stepIndex) => (
                      <li
                        key={stepIndex}
                        className="flex items-start gap-4 group"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700 font-semibold text-sm flex items-center justify-center transition-all">
                          {stepIndex + 1}
                        </span>
                        <p className="text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Extra Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            ✨ Additional Features
          </h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>
                <strong>Blog Generation:</strong> Generate SEO-rich blogs instantly from product details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>
                <strong>Real-time Updates:</strong> Your dashboard refreshes automatically after each optimization.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>
                <strong>Persistent Connection:</strong> Your Shopify store remains securely linked for future use.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
