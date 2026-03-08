'use server';

import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function addActivity(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  const client_rut = formData.get('client_rut') as string;
  const type = formData.get('type') as 'call' | 'email' | 'meeting' | 'task';
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;
  const outcome = formData.get('outcome') as string;
  const next_step = formData.get('next_step') as string;
  const due_date = formData.get('due_date') as string | null;

  const { error } = await supabase.from('activities').insert({
    client_rut,
    rep_id: user.id,
    type,
    date: new Date(date).toISOString(),
    notes: notes || null,
    outcome: outcome || null,
    next_step: next_step || null,
    due_date: due_date ? new Date(due_date).toISOString() : null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/clients/${client_rut}`); // Revalidate the client details page to show new activity
  revalidatePath('/tasks'); // Revalidate tasks page if a new task was added
  return { success: true, message: 'Activity logged successfully!' };
}

export async function toggleTaskCompleted(taskId: string, currentCompletedStatus: boolean) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const newCompletedAt = currentCompletedStatus ? null : new Date().toISOString();

  const { error } = await supabase
    .from('activities')
    .update({ completed_at: newCompletedAt })
    .eq('id', taskId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/tasks');
  return { success: true, message: 'Task status updated.' };
}