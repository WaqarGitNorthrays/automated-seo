// utils/parseSolutions.js
export default function parseSolutions(solutionsString) {
  if (!solutionsString || typeof solutionsString !== "string") return [];

  try {
    let cleaned = solutionsString
      // Escape real newlines
      .replace(/\n/g, "\\n")
      // Handle Python literals
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");

    // Convert single-quoted keys/strings to JSON-safe double quotes
    // This regex ensures we only convert outer-level single quotes, not inside arrays
    cleaned = cleaned.replace(/([{,]\s*)'([^']*?)'\s*:/g, '$1"$2":');
    cleaned = cleaned.replace(/:\s*'([^']*?)'(?=[,}])/g, (_, val) => {
      // Escape existing double quotes inside the value
      const safe = val.replace(/"/g, '\\"');
      return `:"${safe}"`;
    });

    // Wrap in [] if not already
    if (!cleaned.trim().startsWith("[")) cleaned = `[${cleaned}]`;

    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.error("❌ parseSolutions failed even after cleaning:", err);
    console.warn("👉 Raw string snippet:", solutionsString.slice(0, 500));
    return [];
  }
}
