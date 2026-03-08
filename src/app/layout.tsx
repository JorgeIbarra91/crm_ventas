import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sales CRM',
  description: 'CRM for sales territories in Chile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-900">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 sm:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}