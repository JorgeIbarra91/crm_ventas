import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options, maxAge: -1 });
        },
      },
    }
  );

  await supabase.auth.getSession(); // Refresh session to get updated cookie(s)

  const publicPaths = ['/login', '/auth/callback'];

  if (!request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) { // Exclude Next.js internal paths and API routes
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && !publicPaths.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'], // Match all routes except static files
};