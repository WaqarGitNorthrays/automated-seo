import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';

const getStatusColor = (score) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 60) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};

export default function ProductCard({ 
  product, 
  index, 
  onViewReport,
  // getStatusIcon
}) {
  const hasResolution = !!product.issues_and_proposed_solutions;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-4">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {product['Product Name'] || `Product ${index + 1}`}
            </h3>
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(product['SEO Score'])} flex items-center`}>
            {/* {getStatusIcon(product['SEO Score'])} */}
            <span className="ml-1">{product['SEO Score']}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          {product.status || 'Active'}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {hasResolution ? 'Solution Available' : 'Analysis Only'}
          </span>
          <button
            onClick={() => onViewReport(product, hasResolution ? 'solution' : 'analysis')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            View {hasResolution ? 'Solution' : 'Analysis'}
            <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
