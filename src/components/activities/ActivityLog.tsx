import React from 'react';
import { Phone, Mail, Users, CheckSquare, Calendar, Clock } from 'lucide-react';
import moment from 'moment';
import { createServerClientFromCookies } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  date: string;
  notes: string | null;
  outcome: string | null;
  next_step: string | null;
  due_date: string | null;
  profiles?: {
    full_name: string;
  }[];
}

interface ActivityLogProps {
  clientRut: string;
  filterType?: 'call' | 'email' | 'meeting' | 'task' | 'all';
}

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
  switch (type) {
    case 'call': return <Phone className="h-5 w-5 text-blue-500" />;
    case 'email': return <Mail className="h-5 w-5 text-yellow-500" />;
    case 'meeting': return <Users className="h-5 w-5 text-purple-500" />;
    case 'task': return <CheckSquare className="h-5 w-5 text-green-500" />;
    default: return null;
  }
};

export default async function ActivityLog({ clientRut, filterType = 'all' }: ActivityLogProps) {
  const supabase = createServerClientFromCookies();

  let query = supabase
    .from('activities')
    .select(`
      id,
      type,
      date,
      notes,
      outcome,
      next_step,
      due_date,
      profiles (
        full_name
      )
    `)
    .eq('client_rut', clientRut)
    .order('date', { ascending: false });

  if (filterType !== 'all') {
    query = query.eq('type', filterType);
  }

  const { data: activities, error } = await query;

  if (error) {
    console.error('Error fetching activities:', error);
    return <div className="text-red-500">Error loading activities.</div>;
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Client Activities</h2>

      {activities?.length === 0 ? (
        <p className="text-slate-300">No activities logged for this client yet.</p>
      ) : (
        <div className="space-y-8">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-slate-100 capitalize">{activity.type}</span>
                  <span className="text-sm text-slate-400">
                    {moment(activity.date).format('MMMM Do YYYY, h:mm a')}
                  </span>
                </div>
                {activity.profiles?.[0]?.full_name && (
                  <p className="text-sm text-slate-300">Rep: {activity.profiles[0].full_name}</p>
                )}
                {activity.notes && (
                  <p className="text-slate-200 mt-2">{activity.notes}</p>
                )}
                {activity.outcome && (
                  <p className="text-sm text-slate-300 mt-1">Outcome: {activity.outcome}</p>
                )}
                {activity.next_step && (
                  <p className="text-sm text-slate-300 mt-1">Next Step: {activity.next_step}</p>
                )}
                {activity.due_date && activity.type === 'task' && (
                  <p className="text-sm text-slate-300 mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Due: {moment(activity.due_date).format('MMMM Do YYYY')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}