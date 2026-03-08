'use server';

import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return redirect('/login?message=Could not authenticate user');
  }

  return redirect('/');
}

export async function signOut() {
  const cookieStore = cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return redirect('/?message=Could not sign out');
  }

  return redirect('/login');
}