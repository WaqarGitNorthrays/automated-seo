"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, RotateCcw } from "lucide-react";

export const ProductFilters = ({ onFilterChange, onReset, initialFilters = {}, hideAnalyzed = false}) => {
  const [filters, setFilters] = useState({
    active: initialFilters.active ?? null,
    optimized: initialFilters.optimized ?? null,
    analyzed: initialFilters.analyzed ?? null,
    score_min: initialFilters.score_min ?? 0,
    score_max: initialFilters.score_max ?? 100,
  });

  // Sync with initialFilters
  useEffect(() => {
    setFilters({
      active: initialFilters.active ?? null,
      optimized: initialFilters.optimized ?? null,
      analyzed: initialFilters.analyzed ?? null,
      score_min: initialFilters.score_min ?? 0,
      score_max: initialFilters.score_max ?? 100,
    });
  }, [initialFilters]);

  // 🔧 Helper: Build clean payload before sending to parent
  const buildFilterPayload = useCallback((raw) => {
    const clean = { ...raw };

    // If score range is full range, treat as "no filter"
    if (clean.score_min === 0 && clean.score_max === 100) {
      clean.score_min = null;
      clean.score_max = null;
    }

    // Remove any keys that are null
    Object.keys(clean).forEach((key) => {
      if (clean[key] === null) delete clean[key];
    });

    return clean;
  }, []);

  const handleChange = useCallback(
    (name, value) => {
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);
      onFilterChange?.(buildFilterPayload(newFilters));
    },
    [filters, onFilterChange, buildFilterPayload]
  );

const debounceRef = useRef(null);

const handleScoreChange = useCallback(
  (values) => {
    const [min, max] = values;
    const newFilters = { ...filters, score_min: min, score_max: max };
    setFilters(newFilters);

    // 🕐 Debounce logic
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange?.(buildFilterPayload(newFilters));
    }, 400); // fire only after user stops moving slider for 400ms
  },
  [filters, onFilterChange, buildFilterPayload]
);

useEffect(() => {
  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, []);



  const handleReset = useCallback(() => {
    const resetFilters = {
      active: null,
      optimized: null,
      analyzed: null,
      score_min: 0,
      score_max: 100,
    };
    setFilters(resetFilters);
    onReset?.(buildFilterPayload(resetFilters));
  }, [onReset, buildFilterPayload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
            Product Filters
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active */}
        <div className="flex flex-col space-y-2">
          <Label className="text-sm text-gray-700">Active Status</Label>
          <Select
            value={filters.active === null ? undefined : String(filters.active)}
            onValueChange={(value) =>
              handleChange("active", value === "true" ? true : value === "false" ? false : null)
            }
          >
            <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Optimized */}
        <div className="flex flex-col space-y-2">
          <Label className="text-sm text-gray-700">Optimized</Label>
          <Select
            value={filters.optimized === null ? undefined : String(filters.optimized)}
            onValueChange={(value) =>
              handleChange("optimized", value === "true" ? true : value === "false" ? false : null)
            }
          >
            <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analyzed */}
        {!hideAnalyzed && (
        <div className="flex flex-col space-y-2">
          <Label className="text-sm text-gray-700">Analyzed</Label>
          <Select
            value={filters.analyzed === null ? undefined : String(filters.analyzed)}
            onValueChange={(value) =>
              handleChange("analyzed", value === "true" ? true : value === "false" ? false : null)
            }
          >
            <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        )}

        {/* SEO Score */}
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-gray-700">SEO Score</Label>
            <span className="text-xs text-gray-500 font-medium">
              {filters.score_min} - {filters.score_max}
            </span>
          </div>
          <Slider
            value={[filters.score_min, filters.score_max]}
            onValueChange={handleScoreChange}
            min={0}
            max={100}
            step={1}
            minStepsBetweenThumbs={2}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductFilters;
