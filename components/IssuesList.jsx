'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSCStore } from '@/store/gscStore';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// -----------------------------
// Utility Functions
// -----------------------------
const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

const getSeverityLabel = (severity) =>
  severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Info';

// -----------------------------
// Collapsible Solution Component
// -----------------------------
const SolutionCard = ({ solution }) => {
  const steps = solution.split('*').filter((s) => s.trim().length > 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <SparklesIcon className="h-5 w-5 text-green-500" />
        <h4 className="text-sm font-semibold text-green-800">
          Optimization Plan
        </h4>
      </div>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-green-700 leading-relaxed"
          >
            <CheckCircleIcon className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            {s.trim()}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// -----------------------------
// Main Component
// -----------------------------
const IssuesList = () => {
  const { issues, resolveIssues, resolveSingleIssue, isLoading: isResolvingAll } = useGSCStore();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Data is already normalized in the store
  const hasIssues = Array.isArray(issues) && issues.length > 0;
  const isAnyResolving = issues.some(issue => issue.isResolving);
  
  // Check if all issues are resolved
  const allResolved = hasIssues && issues.every(issue => issue.Solution);
  const someResolved = hasIssues && issues.some(issue => issue.Solution);

  // -----------------------------
  // Group issues by category
  // -----------------------------
  const grouped = issues.reduce((acc, issue) => {
    const category = issue.Issue?.toLowerCase().includes('speed')
      ? 'Performance'
      : issue.Issue?.toLowerCase().includes('usability')
      ? 'Mobile Usability'
      : 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(issue);
    return acc;
  }, {});


  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="space-y-6">
      {/* Resolve All Button - Show if there are any unresolved issues */}
      {hasIssues && !allResolved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <button
            onClick={resolveIssues}
            disabled={isResolvingAll || isAnyResolving}
            className="px-4 py-2 text-sm font-medium rounded-md shadow text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isResolvingAll ? 'Resolving All...' : 'Resolve All'}
          </button>
        </motion.div>
      )}

      {/* ---------- NO ISSUES ---------- */}
      {!hasIssues && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-green-50 p-5 text-green-700 border border-green-200 text-center"
        >
          <CheckCircleIcon className="mx-auto h-6 w-6 text-green-600 mb-1" />
          <p className="font-medium">
            No active issues found. Your website is in great shape! 🎉
          </p>
        </motion.div>
      )}

      {/* ---------- ISSUES BY CATEGORY ---------- */}
      {hasIssues &&
        Object.entries(grouped).map(([category, catIssues], catIndex) => (
          <motion.div
            key={catIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: catIndex * 0.1 }}
            className="space-y-3"
          >
            <h4 className="text-md font-semibold text-gray-800 mt-2 border-l-4 border-indigo-500 pl-2">
              {category}
            </h4>
            {catIssues.map((issue, index) => (
              <motion.div
                key={index}
                layout
                className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition ${getSeverityColor(
                  issue.severity || 'low'
                )}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {issue.severity === 'high' ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    ) : issue.severity === 'medium' ? (
                      <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900">
                        {issue.Issue || issue.label || 'Website Issue'}
                      </h5>
                      {!issue.Solution && (
                        <p className="text-xs text-gray-600 mt-1">
                          This needs attention to improve site performance.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {!issue.Solution ? (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const success = await resolveSingleIssue(issue.Issue);
                            if (success) {
                              // Auto-expand to show the solution
                              setExpandedIndex(`${catIndex}-${index}`);
                            }
                          }}
                          disabled={isResolvingAll || issue.isResolving || isAnyResolving}
                          className="px-2.5 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors min-w-[70px]"
                          title={issue.isResolving ? 'Resolving...' : 'Mark as resolved'}
                        >
                          {issue.isResolving ? 'Resolving...' : 'Resolve'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCopy(`${issue.Issue}\n\n${issue.Solution}`)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
                          title="Copy Fix Plan"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Solution */}
                {issue.Solution && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedIndex(
                          expandedIndex === `${catIndex}-${index}`
                            ? null
                            : `${catIndex}-${index}`
                        )
                      }
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                    >
                      {expandedIndex === `${catIndex}-${index}` ? (
                        <>
                          Hide Recommendations <ChevronUpIcon className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Recommendations <ChevronDownIcon className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedIndex === `${catIndex}-${index}` && (
                        <SolutionCard solution={issue.Solution} />
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ))}
    </div>
  );
};

export default IssuesList;
