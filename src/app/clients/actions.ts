'use server';

import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { parse } from 'csv-parse/sync';

interface ClientCSV {
  RUT: string;
  Name: string;
  Email: string;
  Phone: string;
  Comuna: string;
}

export async function importClients(formData: FormData) {
  const csvFile = formData.get('csvFile') as File;
  if (!csvFile) {
    return { success: false, error: 'No CSV file provided.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  try {
    const csvBuffer = await csvFile.arrayBuffer();
    const csvString = Buffer.from(csvBuffer).toString('utf8');

    const records: ClientCSV[] = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
    });

    const { data: comunasData, error: comunasError } = await supabase.from('comunas').select('id, name');
    if (comunasError) throw comunasError;
    const comunasMap = new Map(comunasData?.map(c => [c.name.toLowerCase(), c.id]));

    const clientsToUpsert = [];
    for (const record of records) {
      const comunaId = comunasMap.get(record.Comuna.toLowerCase());
      if (!comunaId) {
        continue; // Skip clients with unknown comunas
      }

      clientsToUpsert.push({
        rut: record.RUT,
        name: record.Name,
        email: record.Email,
        phone: record.Phone,
        comuna_id: comunaId,
        // created_by will be set by a RLS policy or handled by another trigger if needed
      });
    }

    if (clientsToUpsert.length === 0) {
      return { success: false, error: 'No valid clients to import after validation.' };
    }

    const { error: upsertError } = await supabase.from('clients').upsert(clientsToUpsert, {
      onConflict: 'rut',
      ignoreDuplicates: false,
    });

    if (upsertError) {
      console.error('Error upserting clients:', upsertError);
      throw upsertError;
    }

    return { success: true, message: `Successfully imported/updated ${clientsToUpsert.length} clients.` };
  } catch (error: any) {
    console.error('Error during client import:', error);
    return { success: false, error: error.message };
  }
}