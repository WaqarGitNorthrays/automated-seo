'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';

// Import components with SSR disabled
const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={inter.className}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
      </div>
      
      <Toaster position="top-right" />
      <ChatBot />
    </div>
  );
}
