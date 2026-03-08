'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabaseBrowser'; // Using browser client for client-side fetches
import { useRouter } from 'next/navigation';

interface AlertClient {
  rut: string;
  client_name: string;
  comuna_name: string | null;
  days_since_last_sale: number | null;
  status_color: 'Green' | 'Yellow' | 'Red';
}

export default function AlertPanel() {
  const [redClients, setRedClients] = useState<AlertClient[]>([]);
  const [yellowClients, setYellowClients] = useState<AlertClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAlertClients() {
      setLoading(true);
      setError(null);
      const supabase = createBrowserClient(); // Client-side client

      try {
        const { data: clients, error: fetchError } = await supabase
          .from('client_status')
          .select('rut, client_name, comuna_name, days_since_last_sale, status_color')
          .or('status_color.eq.Red,status_color.eq.Yellow')
          .order('days_since_last_sale', { ascending: false });

        if (fetchError) throw fetchError;

        setRedClients(clients?.filter(c => c.status_color === 'Red') || []);
        setYellowClients(clients?.filter(c => c.status_color === 'Yellow') || []);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch alert clients.');
      } finally {
        setLoading(false);
      }
    }
    fetchAlertClients();
  }, []);

  const handleLogNewSale = (clientRut: string) => {
    router.push(`/sales/new?clientRut=${clientRut}`);
  };

  if (loading) return <div className="text-slate-300">Loading alerts...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Inactivity Alerts</h2>

      {redClients.length > 0 && (
        <div>
<h3 className="text-xl font-semibold text-red-500 mb-4">Red Clients ({'>'}60 days)</h3>
          <ul className="space-y-4">
            {redClients.map((client) => (
              <li key={client.rut} className="flex justify-between items-center bg-zinc-700 p-4 rounded-md">
                <div>
                  <p className="font-medium text-slate-100">{client.client_name}</p>
                  <p className="text-sm text-slate-300">{client.comuna_name} - {client.days_since_last_sale} days inactive</p>
                </div>
                <button
                  onClick={() => handleLogNewSale(client.rut)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                >
                  Log Sale
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {yellowClients.length > 0 && (
        <div className={redClients.length > 0 ? 'mt-8' : ''}>
          <h3 className="text-xl font-semibold text-yellow-500 mb-4">Yellow Clients (31-60 days)</h3>
          <ul className="space-y-4">
            {yellowClients.map((client) => (
              <li key={client.rut} className="flex justify-between items-center bg-zinc-700 p-4 rounded-md">
                <div>
                  <p className="font-medium text-slate-100">{client.client_name}</p>
                  <p className="text-sm text-slate-300">{client.comuna_name} - {client.days_since_last_sale} days inactive</p>
                </div>
                <button
                  onClick={() => handleLogNewSale(client.rut)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                >
                  Log Sale
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {redClients.length === 0 && yellowClients.length === 0 && (
        <p className="text-slate-300">No inactive clients to alert.</p>
      )}
    </div>
  );
}