// Dashboard API client — fetches aggregated stats for the main dashboard.

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client.js';

/** GET /api/dashboard/stats → aggregated dashboard data. */
export async function getDashboardStats({ signal } = {}) {
  const data = await apiRequest('/api/dashboard/stats', { signal });
  return data;
}

/** Dashboard stats query with auto-refresh. */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: ({ signal }) => getDashboardStats({ signal }),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
}