import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sales CRM',
  description: 'CRM for sales territories in Chile',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const currentPath = cookieStore.get('supabase.current-path')?.value || '/';

  // Redirect unauthenticated users to login page, unless they are already on login page
  if (!user && !currentPath.startsWith('/login') && !currentPath.startsWith('/auth/callback')) {
    redirect('/login');
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-slate-200`}>
        {user ? (
          <div className="flex flex-col lg:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-8">
              {children}
            </main>
          </div>
        ) : (
          <main>
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
