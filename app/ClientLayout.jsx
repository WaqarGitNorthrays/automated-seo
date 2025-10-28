'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import { Skeleton } from '@/components/ui/skeleton';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state on initial render
  if (!isMounted) {
    return (
      <div className={`${inter.className} flex min-h-screen bg-gray-50`}>
        <div className="w-64 border-r border-gray-200 bg-white p-4">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={inter.className}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      <Toaster position="top-right" />
      <ChatBot />
    </div>
  );
}
