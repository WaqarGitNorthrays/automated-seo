import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SEO Expert Dashboard - Automated SEO Optimization',
  description: 'Powerful SEO automation dashboard for Shopify stores. Analyze products, resolve issues, and optimize for search engines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
