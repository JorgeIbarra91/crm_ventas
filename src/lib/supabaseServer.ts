import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function createServerClientFromCookies(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // The `cookies().set()` method can only be called from a Server Component or Action.
            // This error is safe to ignore if you're only reading cookies server-side.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (e) {
            // The `cookies().set()` method can only be called from a Server Component or Action.
            // This error is safe to ignore if you're only reading cookies server-side.
          }
        },
      },
    }
  );
}