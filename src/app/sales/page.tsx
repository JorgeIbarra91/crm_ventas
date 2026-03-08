import React from 'react';
import moment from 'moment';
import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface Sale {
  id: string;
  client_rut: string;
  clients: {
    name: string;
  }[] | null; // Can be null if client is not found or returns as array
  amount: number;
  sale_date: string;
  notes: string | null;
}

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-zinc-900 text-slate-200 p-8">Please log in to view sales history.</div>;
  }

  let query = supabase
    .from('sales')
    .select(`
      id,
      client_rut,
      amount,
      sale_date,
      notes,
      clients (
        name
      )
    `)
    .eq('rep_id', user.id)
    .order('sale_date', { ascending: false });


  if (searchParams.startDate) {
    query = query.gte('sale_date', searchParams.startDate);
  }
  if (searchParams.endDate) {
    query = query.lte('sale_date', searchParams.endDate);
  }

  const { data: sales, error } = await query;

  if (error) {
    console.error('Error fetching sales:', error);
    return <div className="text-red-500">Error loading sales history.</div>;
  }

  const totalSalesAmount = sales ? sales.reduce((sum, sale) => sum + sale.amount, 0) : 0;

  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-6">Sales History</h1>

      <div className="flex space-x-4 mb-6">
        <input
          type="date"
          className="p-2 rounded bg-zinc-700 border border-zinc-600 text-slate-200"
          defaultValue={searchParams.startDate || ''}
          onChange={(e) => {
            const newSearchParams = new URLSearchParams(searchParams as any);
            if (e.target.value) {
              newSearchParams.set('startDate', e.target.value);
            } else {
              newSearchParams.delete('startDate');
            }
            window.location.search = newSearchParams.toString();
          }}
        />
        <input
          type="date"
          className="p-2 rounded bg-zinc-700 border border-zinc-600 text-slate-200"
          defaultValue={searchParams.endDate || ''}
          onChange={(e) => {
            const newSearchParams = new URLSearchParams(searchParams as any);
            if (e.target.value) {
              newSearchParams.set('endDate', e.target.value);
            } else {
              newSearchParams.delete('endDate');
            }
            window.location.search = newSearchParams.toString();
          }}
        />
      </div>

      <div className="bg-zinc-800 p-4 rounded-lg shadow-xl text-lg font-semibold text-slate-100">
        Total Sales for Period: ${totalSalesAmount.toFixed(2)}
      </div>

      <div className="overflow-x-auto bg-zinc-800 rounded-lg shadow-xl">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-700">
            <tr>
              {['Client Name', 'RUT', 'Amount', 'Sale Date', 'Notes'].map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {sales?.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-700 odd:bg-zinc-800 even:bg-zinc-850">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{sale.clients?.[0]?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.client_rut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${sale.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{moment(sale.sale_date).format('YYYY-MM-DD')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.notes || 'No notes'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}