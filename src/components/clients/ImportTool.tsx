'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importClients } from '@/app/clients/actions';

export default function ImportTool() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a CSV file to import.');
      return;
    }

    setMessage('Importing...');

    const formData = new FormData();
    formData.append('csvFile', file);

    // This would typically be a Server Action
    // For now, we'll simulate it or call an API route
    try {
      // In a real application, you'd send this to a server action or API route
      // For example:
      // const response = await fetch('/api/clients/import', { method: 'POST', body: formData });
      // const result = await response.json();
      //
      // if (result.success) {
      //   setMessage('Import successful!');
      //   router.refresh(); // Refresh client list
      // } else {
      //   setMessage(`Import failed: ${result.error}`);
      // }

      // Simulate a server action call for now
    const result = await importClients(formData);

    if (result.success) {
      setMessage(result.message as string);
      router.refresh(); // Refresh client list
    } else {
      setMessage(`Import failed: ${result.error}`);
    }
    } catch (error: any) {
      setMessage(`An error occurred during import: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-zinc-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Bulk Import Clients</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600 cursor-pointer"
        />
        <button
          type="submit"
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          disabled={!file}
        >
          Import CSV
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
    </div>
  );
}