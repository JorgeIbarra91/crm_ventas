import React from 'react';
import { createServerClientFromCookies } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ActivityLog from '@/components/activities/ActivityLog';
import NewActivityForm from '@/components/activities/NewActivityForm';

export const dynamic = 'force-dynamic';

interface ClientDetails {
  rut: string;
  name: string;
  email: string | null;
  phone: string | null;
  comunas: { name: string } | null;
  regions: { name: string } | null;
  last_sale_date: string | null;
  status_color: 'Green' | 'Yellow' | 'Red';
}

export default async function ClientDetailsPage({ params }: { params: { rut: string } }) {
  const { rut } = params;
  const cookieStore = cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { data: client, error } = await supabase
    .from('client_status') // Use the view that includes status_color
    .select(
      `
      rut,
      name,
      email,
      phone,
      comunas(name),
      regions(name),
      last_sale_date,
      status_color
      `
    )
    .eq('rut', rut)
    .single();

  if (error || !client) {
    console.error('Error fetching client details:', error);
    notFound();
  }

  // Determine status color class
  let statusColorClass = '';
  switch (client.status_color) {
    case 'Green':
      statusColorClass = 'bg-green-500';
      break;
    case 'Yellow':
      statusColorClass = 'bg-yellow-500';
      break;
    case 'Red':
      statusColorClass = 'bg-red-500';
      break;
    default:
      statusColorClass = 'bg-gray-500';
  }


  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-slate-100">{client.name} <span className="text-xl text-slate-400">({client.rut})</span></h1>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}>
          {client.status_color}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-800 p-6 rounded-lg shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Client Information</h2>
          <p><strong>Email:</strong> {client.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
          <p><strong>Comuna:</strong> {client.comunas?.name || 'N/A'}</p>
          <p><strong>Region:</strong> {client.regions?.name || 'N/A'}</p>
          <p><strong>Last Sale Date: </strong>{client.last_sale_date ? new Date(client.last_sale_date).toLocaleDateString() : 'N/A'}</p>
          {/* Purchase History will go here */}
        </div>
        <ClientActions clientRut={rut} />
      </div>

      <ActivityLog clientRut={rut} />

    </div>
  );
}

function ClientActions({ clientRut }: { clientRut: string }) {
  const [showNewActivityForm, setShowNewActivityForm] = React.useState(false);

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Actions</h2>
      <button
        onClick={() => setShowNewActivityForm(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Log New Activity
      </button>

      {showNewActivityForm && (
        <NewActivityForm
          clientRut={clientRut}
          onActivityAdded={() => { /* maybe add a toast notification later */ }}
          onClose={() => setShowNewActivityForm(false)}
        />
      )}
    </div>
  );
}
