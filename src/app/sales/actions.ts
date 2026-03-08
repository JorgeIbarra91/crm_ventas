'use server';

import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function searchClientsForSale(query: string) {
  const cookieStore = cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { data, error } = await supabase
    .from('clients')
    .select('rut, name')
    .ilike('rut', `%${query}%`)
    .or(`name.ilike.%${query}%`)
    .limit(10);

  if (error) {
    return [];
  }
  return data;
}

export async function addSale(formData: FormData) {
  const client_rut = formData.get('client_rut') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const sale_date = formData.get('sale_date') as string;
  const notes = formData.get('notes') as string;

  const cookieStore = cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  // Get current user's ID to use as rep_id
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  const { error } = await supabase.from('sales').insert({
    client_rut,
    amount,
    sale_date,
    notes,
    rep_id: user.id, // Assign current user as the sales rep
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // After adding the sale, redirect to the client's profile page
  redirect(`/clients/${client_rut}`); // This redirect should be handled in the client by the useFormStatus or similar
  return { success: true, message: 'Sale added successfully.' };
}