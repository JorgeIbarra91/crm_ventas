'use client';

import React, { useEffect, useState } from 'react';
import { getSalesByGeography } from '@/app/dashboard/actions'; // Assuming this action returns data
import { MapPin, Globe } from 'lucide-react';

interface SalesData {
  name: string;
  total_sales: number;
}

export default function GeographyChart() {
  const [salesByComuna, setSalesByComuna] = useState<SalesData[]>([]);
  const [salesByRegion, setSalesByRegion] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesData() {
      setLoading(true);
      const result = await getSalesByGeography();
      if (result.error) {
        setError(result.error);
      } else {
        setSalesByComuna(result.salesByComuna);
        setSalesByRegion(result.salesByRegion);
      }
      setLoading(false);
    }
    fetchSalesData();
  }, []);

  if (loading) return <div className="text-slate-300">Loading sales by geography...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-blue-400" /> Top 5 Comunas by Sales
        </h2>
        {salesByComuna.length === 0 ? (
          <p className="text-slate-300">No sales data for comunas.</p>
        ) : (
          <ul className="space-y-3">
            {salesByComuna.map((data, index) => (
              <li key={index} className="flex justify-between items-center text-slate-200">
                <span className="font-medium">{data.name}</span>
                <span className="text-lg font-semibold">${data.total_sales.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center">
          <Globe className="h-6 w-6 mr-2 text-green-400" /> Top 5 Regions by Sales
        </h2>
        {salesByRegion.length === 0 ? (
          <p className="text-slate-300">No sales data for regions.</p>
        ) : (
          <ul className="space-y-3">
            {salesByRegion.map((data, index) => (
              <li key={index} className="flex justify-between items-center text-slate-200">
                <span className="font-medium">{data.name}</span>
                <span className="text-lg font-semibold">${data.total_sales.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}