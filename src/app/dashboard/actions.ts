'use server';

import { createServerClientFromCookies } from '@/lib/supabaseServer';
import moment from 'moment';

export async function getDashboardStats() {
  const supabase = createServerClientFromCookies();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalSalesMTD: 0,
      activeClients: 0,
      atRiskClients: 0,
      inactiveClients: 0,
      error: 'User not authenticated.',
    };
  }

  const currentMonthStart = moment().startOf('month').toISOString();
  const currentMonthEnd = moment().endOf('month').toISOString();

  // Fetch Total Sales MTD
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('amount')
    .eq('rep_id', user.id)
    .gte('sale_date', currentMonthStart)
    .lte('sale_date', currentMonthEnd);

  const totalSalesMTD = salesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;

  // Fetch client statuses
  const { data: clientStatusData, error: clientStatusError } = await supabase
    .from('client_status')
    .select('status_color')
    .eq('assigned_to_rep_id', user.id);

  const activeClients = clientStatusData?.filter(c => c.status_color === 'Green').length || 0;
  const atRiskClients = clientStatusData?.filter(c => c.status_color === 'Yellow').length || 0;
  const inactiveClients = clientStatusData?.filter(c => c.status_color === 'Red').length || 0;

  if (salesError || clientStatusError) {
    return {
      totalSalesMTD: 0,
      activeClients: 0,
      atRiskClients: 0,
      inactiveClients: 0,
      error: salesError?.message || clientStatusError?.message || 'Unknown error fetching stats.',
    };
  }

  return {
    totalSalesMTD,
    activeClients,
    atRiskClients,
    inactiveClients,
    error: null,
  };
}

export async function getSalesByGeography() {
  const supabase = createServerClientFromCookies();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      salesByComuna: [],
      salesByRegion: [],
      error: 'User not authenticated.',
    };
  }

  // Sales by Comuna
  const { data: salesComuna, error: salesComunaError } = await supabase
    .rpc('get_sales_by_comuna', { rep_id_param: user.id })
    .limit(5);

  // Sales by Region
  const { data: salesRegion, error: salesRegionError } = await supabase
    .rpc('get_sales_by_region', { rep_id_param: user.id })
    .limit(5);

  if (salesComunaError || salesRegionError) {
    return {
      salesByComuna: [],
      salesByRegion: [],
      error: salesComunaError?.message || salesRegionError?.message || 'Unknown error fetching sales by geography.',
    };
  }

  return {
    salesByComuna: salesComuna || [],
    salesByRegion: salesRegion || [],
    error: null,
  };
}