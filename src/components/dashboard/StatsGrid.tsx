'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '@/app/dashboard/actions';
import { DollarSign, UserCheck, UserX, UserMinus } from 'lucide-react';

interface Stats {
  totalSalesMTD: number;
  activeClients: number;
  atRiskClients: number;
  inactiveClients: number;
  error: string | null;
}

export default function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const result = await getDashboardStats();
      if (result.error) {
        setError(result.error);
      } else {
        setStats(result);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div className="text-slate-300">Loading stats...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Sales MTD"
        value={`$${stats.totalSalesMTD.toFixed(2)}`}
        icon={<DollarSign className="h-6 w-6 text-blue-400" />}
        color="bg-blue-800"
      />
      <StatCard
        title="Active Clients"
        value={stats.activeClients.toString()}
        icon={<UserCheck className="h-6 w-6 text-green-400" />}
        color="bg-green-800"
      />
      <StatCard
        title="At Risk Clients"
        value={stats.atRiskClients.toString()}
        icon={<UserMinus className="h-6 w-6 text-yellow-400" />}
        color="bg-yellow-800"
      />
      <StatCard
        title="Inactive Clients"
        value={stats.inactiveClients.toString()}
        icon={<UserX className="h-6 w-6 text-red-400" />}
        color="bg-red-800"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md ${color}`}>
      <div className="flex-shrink-0 mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="text-xl font-semibold text-slate-50">{value}</p>
      </div>
    </div>
  );
}