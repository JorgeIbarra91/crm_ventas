import StatsGrid from '@/components/dashboard/StatsGrid';
import AlertPanel from '@/components/dashboard/AlertPanel'; // From Step 5
import GeographyChart from '@/components/dashboard/GeographyChart';
import RecentActivities from '@/components/activities/RecentActivities';
import React from 'react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 p-4 sm:p-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Inactivity Alert Panel (Left/Center) */}
        <div className="lg:col-span-1">
          <AlertPanel />
        </div>

        {/* Sales by Geography Chart (Right) */}
        <div className="lg:col-span-2">
          <GeographyChart />
        </div>
      </div>

      {/* Recent Activities Feed (Bottom) */}
      <RecentActivities />
    </div>
  );
}