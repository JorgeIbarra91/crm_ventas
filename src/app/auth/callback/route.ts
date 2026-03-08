import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClientFromCookies();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return redirect('/');
}