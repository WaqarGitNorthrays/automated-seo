export const getSeoScoreColor = (score) => {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export const getStatusColor = (status) => {
  const statusMap = {
    active: "bg-blue-100 text-blue-800",
    analyzed: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
  };
  return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

export const getSeverityColor = (severity) => {
  const severityMap = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return severityMap[severity?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toString() || "0";
};

export const formatPercentage = (num) => {
  return num ? num.toFixed(2) + "%" : "0%";
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
