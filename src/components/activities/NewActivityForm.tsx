'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addActivity } from '@/app/activities/actions'; // Will create this server action

interface NewActivityFormProps {
  clientRut: string;
  onActivityAdded: () => void;
  onClose: () => void;
}

export default function NewActivityForm({ clientRut, onActivityAdded, onClose }: NewActivityFormProps) {
  const router = useRouter();
  const [type, setType] = useState<'call' | 'email' | 'meeting' | 'task'>('call');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm format
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('client_rut', clientRut);
    formData.append('type', type);
    formData.append('date', date);
    formData.append('notes', notes);
    formData.append('outcome', outcome);
    formData.append('next_step', nextStep);
    if (type === 'task' && dueDate) {
      formData.append('due_date', dueDate);
    }

    try {
      const result = await addActivity(formData); // This is the server action

      if (result.success) {
        onActivityAdded();
        onClose();
        router.refresh(); // Refresh client details page to show new activity
      } else {
        setError(result.error || 'Failed to add activity.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900 bg-opacity-75 flex justify-end z-50">
      <div className="bg-zinc-800 w-full md:w-1/2 lg:w-1/3 p-8 shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Log New Activity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">
              Activity Type
            </label>
            <select
              id="type"
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
              value={type}
              onChange={(e) => setType(e.target.value as 'call' | 'email' | 'meeting' | 'task')}
              required
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
              Date & Time
            </label>
            <input
              id="date"
              type="datetime-local"
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

          <div>
            <label htmlFor="outcome" className="block text-sm font-medium text-slate-300 mb-1">
              Outcome
            </label>
            <input
              id="outcome"
              type="text"
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="nextStep" className="block text-sm font-medium text-slate-300 mb-1">
              Next Step
            </label>
            <input
              id="nextStep"
              type="text"
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
            />
          </div>

          {type === 'task' && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">
                Due Date (for Task)
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-slate-200 focus:ring-blue-500 focus:border-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required={type === 'task'}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition duration-150 ease-in-out"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}