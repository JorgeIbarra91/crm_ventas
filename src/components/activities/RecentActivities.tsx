import React from 'react';
import { createServerClientFromCookies } from '@/lib/supabaseServer';
import moment from 'moment';
import { cookies } from 'next/headers'; // This import needs to be here.
import { Phone, Mail, Users, CheckSquare } from 'lucide-react';
import Link from 'next/link';

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
  clients?: {
    name: string;
  }[];
  client_rut: string;
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


export default async function RecentActivities() {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-red-500">Please log in to view recent activities.</div>;
  }

  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      date,
      notes,
      outcome,
      next_step,
      due_date,
      client_rut,
      profiles (
        full_name
      ),
      clients (
        name
      )
    `)
    .eq('rep_id', user.id)
    .order('date', { ascending: false })
    .limit(5); // Show latest 5 activities

  if (error) {
    console.error('Error fetching recent activities:', error);
    return <div className="text-red-500">Error loading recent activities.</div>;
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Recent Activities</h2>

      {activities?.length === 0 ? (
        <p className="text-slate-300">No recent activities found.</p>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 bg-zinc-700 p-3 rounded-md">
              <div className="flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-slate-100 capitalize">
                      <Link href={`/clients/${activity.client_rut}`} className="hover:underline">
                        {activity.clients?.[0]?.name || 'N/A'} - {activity.type}
                      </Link>
                  </span>
                  <span className="text-sm text-slate-400">
                    {moment(activity.date).fromNow()}
                  </span>
                </div>
                {activity.profiles?.[0]?.full_name && (
                  <p className="text-sm text-slate-300">Rep: {activity.profiles[0].full_name}</p>
                )}
                {activity.notes && (
                  <p className="text-slate-200 mt-1">{activity.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}