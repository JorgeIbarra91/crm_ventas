'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, CircleX } from 'lucide-react'; // For success/error messages
import { searchClientsForSale, addSale } from '@/app/sales/actions';


export default function NewSalePage() {
  const [clientRut, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ rut: string; name: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (clientRut.length > 2 && !selectedClient) {
      const handler = setTimeout(async () => {
        const results = await searchClientsForSale(clientRut); // Use the imported server action
        setSearchResults(results);
        setShowSearchResults(true);
      }, 300);
      return () => clearTimeout(handler);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [clientRut, selectedClient]);

  const handleClientSelect = (client: { rut: string; name: string }) => {
    setClientRut(client.rut);
    setClientName(client.name);
    setSelectedClient(client);
    setShowSearchResults(false);
  };

  const handleClientRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientRut(e.target.value);
    setSelectedClient(null); // Clear selected client if RUT changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Please select a client from the search results.' });
      return;
    }

    const formData = new FormData();
    formData.append('client_rut', selectedClient.rut);
    formData.append('amount', amount);
    formData.append('sale_date', saleDate);
    formData.append('notes', notes); // notes can be empty

    const result = await addSale(formData); // Use the actual server action here

    if (result.success) {
      setMessage({ type: 'success', text: result.message ?? 'Operation successful!' });
      // Redirect to client profile page - placeholder for now
      router.push(`/clients/${selectedClient.rut}`); // Example redirect
    } else {
      setMessage({ type: 'error', text: result.message ?? 'Operation failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-6">Log New Sale</h1>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 mb-4 rounded-md ${
            message.type === 'success' ? 'bg-green-700' : 'bg-red-700'
          } text-white`}
        >
          {message.type === 'success' ? <CircleCheck size={20} /> : <CircleX size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-800 p-6 rounded-lg shadow-xl space-y-6 max-w-lg mx-auto">
        <div className="relative">
          <label htmlFor="clientRut" className="block text-sm font-medium text-slate-300 mb-1">
            Client RUT
          </label>
          <input
            id="clientRut"
            type="text"
            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            value={clientRut}
            onChange={handleClientRutChange}
            placeholder="Search by RUT or Name..."
            required
            autoComplete="off"
          />
          {showSearchResults && searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-zinc-700 border border-zinc-600 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
              {searchResults.map((client) => (
                <li
                  key={client.rut}
                  className="p-2 hover:bg-zinc-600 cursor-pointer text-sm"
                  onClick={() => handleClientSelect(client)}
                >
                  {client.rut} - {client.name}
                </li>
              ))}
            </ul>
          )}
          {selectedClient && (
            <p className="mt-2 text-sm text-green-400">Selected Client: {selectedClient.name} ({selectedClient.rut})</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="saleDate" className="block text-sm font-medium text-slate-300 mb-1">
            Sale Date
          </label>
          <input
            id="saleDate"
            type="date"
            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          disabled={!selectedClient || !amount || !saleDate}
        >
          Add Sale
        </button>
      </form>
    </div>
  );
}