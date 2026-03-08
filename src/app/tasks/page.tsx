'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabaseBrowser';
import { toggleTaskCompleted } from '@/app/activities/actions';
import { CheckCircle, CircleDot, Calendar } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

interface Task {
  id: string;
  client_rut: string;
  clients: { name: string }[] | null; // Changed to array
  type: 'call' | 'email' | 'meeting' | 'task';
  date: string;
  notes: string | null;
  outcome: string | null;
  next_step: string | null;
  due_date: string | null;
  completed_at: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: 'type=eq.task' },
        (payload: {new: any, old: any}) => { // Explicitly typed payload
          fetchTasks(); // Re-fetch tasks on any change to activities of type 'task'
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    // Fetch tasks that are type 'task' and not completed
    const { data, error: fetchError } = await supabase
      .from('activities')
      .select(`
        id,
        client_rut,
        clients(name),
        type,
        date,
        notes,
        outcome,
        next_step,
        due_date,
        completed_at
      `)
      .eq('rep_id', user.id)
      .eq('type', 'task')
      .is('completed_at', null) // Only pending tasks
      .order('due_date', { ascending: true }); // Most urgent first

    if (fetchError) {
      console.error('Error fetching tasks:', fetchError);
      setError(fetchError.message || 'An unknown error occurred while fetching tasks.');
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  const handleToggleCompleted = async (taskId: string, currentCompletedStatus: boolean) => {
    setLoading(true);
    const result = await toggleTaskCompleted(taskId, currentCompletedStatus);
    if (result.success) {
      // Optimistically update UI or re-fetch
      fetchTasks();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };


  if (loading) return <div className="min-h-screen bg-zinc-900 text-slate-200 p-8">Loading tasks...</div>;
  if (error) return <div className="min-h-screen bg-zinc-900 text-red-500 p-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-6">Pending Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-slate-300">No pending tasks for you. Great job!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isOverdue = task.due_date && moment(task.due_date).isBefore(moment()) && !task.completed_at;
            return (
              <div
                key={task.id}
                className={`bg-zinc-800 p-6 rounded-lg shadow-xl border-l-4 ${isOverdue ? 'border-red-500' : 'border-blue-500'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-xl text-slate-100">
                    <Link href={`/clients/${task.client_rut}`} className="hover:underline">
                      {task.clients?.[0]?.name || 'N/A'} {/* Accessing first element of clients array */}
                    </Link>
                  </h3>
                  <button
                    onClick={() => handleToggleCompleted(task.id, !!task.completed_at)}
                    className="p-1 rounded-full text-zinc-400 hover:text-green-500 transition-colors"
                    title="Mark as completed"
                    disabled={loading}
                  >
                    <CircleDot size={24} />
                  </button>
                </div>
                {task.due_date && (
                  <p className={`text-sm flex items-center mb-2 ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                    <Calendar className="h-4 w-4 mr-1" /> Due: {moment(task.due_date).format('MMMM Do YYYY, h:mm a')}
                  </p>
                )}
                {task.notes && <p className="text-slate-200 mb-3">{task.notes}</p>}
                {task.next_step && <p className="text-sm text-slate-300">Next: {task.next_step}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}