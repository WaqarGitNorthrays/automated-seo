"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/chatStore";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function ChatBot() {
  const {
    isOpen,
    toggleChat,
    messages,
    sendMessage,
    isLoading,
    error,
    tokens,
    clearChat,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const formatMessage = (text) =>
    text.split("\n").map((line, i) => (
      <p key={i} className="mb-2 last:mb-0 leading-relaxed">
        {line.startsWith("*") ? (
          <span className="block ml-4">{line.replace(/^\*\s*/, "• ")}</span>
        ) : (
          line
        )}
      </p>
    ));

  const inputTokens = tokens.input || 0;
  const outputTokens = tokens.output || 0;
  const totalTokens = tokens.total || inputTokens + outputTokens;
  const inputPercent =
    totalTokens > 0 ? (inputTokens / totalTokens) * 100 : 0;
  const outputPercent =
    totalTokens > 0 ? (outputTokens / totalTokens) * 100 : 0;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">SEO Assistant</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  title="Clear chat"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-6">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 mb-2 text-gray-300" />
                  <p>Ask me anything about your website’s SEO performance!</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {formatMessage(m.content)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing shimmer */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 max-w-[80%] shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Token analytics pill */}
            {totalTokens > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 right-4 bg-white/80 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => setShowAnalytics(true)}
              >
                <div className="flex items-center gap-1.5">
                  <ChartBarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">{totalTokens}</span>
                  <span className="text-gray-400">
                    ({inputTokens}/{outputTokens})
                  </span>
                </div>
              </motion.div>
            )}

            {/* Analytics Drawer */}
            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-5 rounded-t-2xl shadow-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4 text-indigo-500" />
                      Token Usage
                    </h3>
                    <button
                      onClick={() => setShowAnalytics(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                      Close
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    Total: <b>{totalTokens}</b> • Input:{" "}
                    <b>{inputTokens}</b> • Output: <b>{outputTokens}</b>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${inputPercent}%` }}
                      className="h-full bg-indigo-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${inputPercent + outputPercent}%`,
                      }}
                      className="h-full bg-blue-400 -mt-3"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
