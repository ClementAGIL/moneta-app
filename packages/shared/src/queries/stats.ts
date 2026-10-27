// Hooks for the dashboard stats.
import { useQuery } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import { keys } from './keys';

export function useSummary(month: string) {
  const api = useApi();
  return useQuery({
    queryKey: keys.summary(month),
    queryFn: async () => unwrap(await api.client.GET('/stats/summary', { params: { query: { month } } })),
  });
}

/** Monthly series per top-level category, months inclusive (YYYY-MM). */
export function useCategorySeries(from: string, to: string) {
  const api = useApi();
  return useQuery({
    queryKey: keys.series(from, to),
    queryFn: async () => unwrap(await api.client.GET('/stats/categories', { params: { query: { from, to } } })),
  });
}

export function useTopMerchants(from: string, to: string, limit = 8) {
  const api = useApi();
  return useQuery({
    queryKey: keys.merchants(from, to),
    queryFn: async () => unwrap(await api.client.GET('/stats/merchants', { params: { query: { from, to, limit } } })),
  });
}

/** End-of-month balance forecast for one account, or all current and card accounts. */
export function useForecast(account?: string) {
  const api = useApi();
  return useQuery({
    queryKey: ['stats', 'forecast', account ?? 'all'],
    queryFn: async () => unwrap(await api.client.GET('/forecast', { params: { query: { account } } })),
  });
}
