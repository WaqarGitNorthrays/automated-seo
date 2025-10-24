'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import the ChatBot component with SSR disabled
const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
});

export default function ClientProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Toaster position="top-right" />
      <ChatBot />
    </>
  );
}
