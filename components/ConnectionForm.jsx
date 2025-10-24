"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

const ConnectionForm = ({ onConnect, isLoading }) => {
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    websiteUrl: "",
    apiKey: "",
    credentialsFile: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => setIsClient(true), []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.websiteUrl.trim())
      newErrors.websiteUrl = "Website URL is required";
    else if (!/^https?:\/\//.test(formData.websiteUrl))
      newErrors.websiteUrl = "Please include http:// or https://";
    if (!formData.apiKey.trim()) newErrors.apiKey = "API key is required";
    if (!formData.credentialsFile)
      newErrors.credentialsFile = "Credentials file required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onConnect({
        websiteUrl: formData.websiteUrl,
        apiKey: formData.apiKey,
        credentials: formData.credentialsFile ? "credentials-processed" : null,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-2xl mx-auto mt-10 relative rounded-3xl bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden"
    >
      {/* Header */}
      <div className="p-8 border-b border-white/30 bg-gradient-to-r from-indigo-50/40 to-transparent">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Connect Your Website
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Securely link to your Google Search Console and start analyzing your site.
        </p>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-7">
        {/* Website URL */}
        <div className="relative">
          <label
            htmlFor="websiteUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Website URL
          </label>
          <input
            type="url"
            name="websiteUrl"
            id="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) => {
              handleChange(e);
              setStep(1);
            }}
            placeholder="https://example.com"
            disabled={isLoading || isUploading}
            className={`block w-full rounded-xl border ${
              errors.websiteUrl ? "border-red-300" : "border-gray-200"
            } bg-white/70 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
          />
          {errors.websiteUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.websiteUrl}</p>
          )}
        </div>

        {/* API Key */}
        <div className="relative">
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Google Cloud API Key
          </label>
          <input
            type="password"
            name="apiKey"
            id="apiKey"
            value={formData.apiKey}
            onChange={(e) => {
              handleChange(e);
              setStep(2);
            }}
            placeholder="Your API Key"
            disabled={isLoading || isUploading}
            className={`block w-full rounded-xl border ${
              errors.apiKey ? "border-red-300" : "border-gray-200"
            } bg-white/70 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
          />
          {errors.apiKey && (
            <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
          )}
        </div>

        {/* File Upload */}
        <div
          onClick={() => document.getElementById("credentialsFile").click()}
          className={`relative group cursor-pointer border-2 ${
            errors.credentialsFile
              ? "border-red-300"
              : "border-dashed border-gray-300 hover:border-indigo-400"
          } rounded-2xl p-10 text-center bg-white/50 hover:bg-white/70 transition-all duration-300`}
        >
          {formData.credentialsFile ? (
            <div className="flex flex-col items-center space-y-2">
              <CloudArrowUpIcon className="w-10 h-10 text-green-500" />
              <p className="font-medium text-gray-900">
                {formData.credentialsFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(formData.credentialsFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((prev) => ({ ...prev, credentialsFile: null }));
                }}
                className="text-sm text-red-600 hover:text-red-500 mt-1"
              >
                Remove File
              </button>
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.03 }}
            >
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-all" />
              <p className="text-gray-700 text-sm">
                <span className="font-medium text-indigo-600">
                  Click to upload
                </span>{" "}
                or drag & drop credentials.json
              </p>
              <p className="text-xs text-gray-400">Up to 10MB JSON file</p>
            </motion.div>
          )}
          <input
            id="credentialsFile"
            name="credentialsFile"
            type="file"
            className="hidden"
            accept=".json"
            onChange={(e) => {
              handleChange(e);
              setStep(3);
            }}
            disabled={isLoading || isUploading}
          />
          {errors.credentialsFile && (
            <p className="mt-2 text-sm text-red-600">
              {errors.credentialsFile}
            </p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || isUploading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-2xl py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Connect Securely
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ConnectionForm;
