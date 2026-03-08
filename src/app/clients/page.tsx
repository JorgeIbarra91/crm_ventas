import React from 'react';
import { Circle } from 'lucide-react';
import ImportTool from '@/components/clients/ImportTool'; // Will create this next
import Link from 'next/link';
import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers'; // Imported for use with createServerClientFromCookies

export const dynamic = 'force-dynamic';

interface Client {
  rut: string;
  client_name: string;
  email: string | null;
  phone: string | null;
  comuna_name: string | null;
  region_name: string | null;
  last_sale_date: string | null;
  status_color: 'Green' | 'Yellow' | 'Red';
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { comuna?: string; region?: string; page?: string };
}) {
  const supabase = createServerClientFromCookies();

  const page = parseInt(searchParams.page || '1');
  const limit = 10; // Items per page
  const offset = (page - 1) * limit;

  let query = supabase
    .from('client_status')
    .select('*', { count: 'exact' });

  if (searchParams.comuna) {
    query = query.filter('comuna_name', 'eq', searchParams.comuna);
  }
  if (searchParams.region) {
    query = query.filter('region_name', 'eq', searchParams.region);
  }

  const { data: clients, error, count } = await query.range(offset, offset + limit - 1);

  const totalPages = count ? Math.ceil(count / limit) : 0;

  if (error) {
    return <div className="text-red-500">Error loading clients.</div>;
  }

  const { data: comunasData, error: comunasError } = await supabase.from('comunas').select('name');
  const comunas = comunasData?.map(c => c.name) || [];

  const { data: regionsData, error: regionsError } = await supabase.from('regions').select('name');
  const regions = regionsData?.map(r => r.name) || [];


  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-6">Client Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select
            className="p-2 rounded bg-zinc-700 border border-zinc-600 text-slate-200"
            defaultValue={searchParams.comuna || ''}
            onChange={(e) => {
              const newSearchParams = new URLSearchParams(searchParams as any);
              if (e.target.value) {
                newSearchParams.set('comuna', e.target.value);
              } else {
                newSearchParams.delete('comuna');
              }
              newSearchParams.set('page', '1');
              window.location.search = newSearchParams.toString();
            }}
          >
            <option value="">All Comunas</option>
            {comunas.map((comuna) => (
              <option key={comuna} value={comuna}>
                {comuna}
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded bg-zinc-700 border border-zinc-600 text-slate-200"
            defaultValue={searchParams.region || ''}
            onChange={(e) => {
              const newSearchParams = new URLSearchParams(searchParams as any);
              if (e.target.value) {
                newSearchParams.set('region', e.target.value);
              } else {
                newSearchParams.delete('region');
              }
              newSearchParams.set('page', '1');
              window.location.search = newSearchParams.toString();
            }}
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <ImportTool />
      </div>

      <div className="overflow-x-auto bg-zinc-800 rounded-lg shadow-xl">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-700">
            <tr>
              {['RUT', 'Name', 'Email', 'Phone', 'Comuna', 'Region', 'Last Sale', 'Status'].map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {clients?.map((client) => (
              <tr key={client.rut} className="hover:bg-zinc-700 odd:bg-zinc-800 even:bg-zinc-850">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{client.rut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{client.client_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{client.comuna_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{client.region_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {client.last_sale_date ? new Date(client.last_sale_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Circle
                    className={`h-5 w-5
                      ${client.status_color === 'Green' ? 'text-green-500' : ''}
                      ${client.status_color === 'Yellow' ? 'text-yellow-500' : ''}
                      ${client.status_color === 'Red' ? 'text-red-500' : ''}
                    `}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href={{
            pathname: '/clients',
            query: { ...searchParams, page: Math.max(1, page - 1).toString() },
          }}
          className={`px-4 py-2 rounded ${page > 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 cursor-not-allowed'} text-white`}
          aria-disabled={page === 1}
        >
          Previous
        </Link>
        <span className="text-sm text-slate-300">
          Page {page} of {totalPages}
        </span>
        <Link
          href={{
            pathname: '/clients',
            query: { ...searchParams, page: Math.min(totalPages, page + 1).toString() },
          }}
          className={`px-4 py-2 rounded ${page < totalPages ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 cursor-not-allowed'} text-white`}
          aria-disabled={page === totalPages}
        >
          Next
        </Link>
      </div>
    </div>
  );
}