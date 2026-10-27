// Hooks for budgets and insights.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import { keys } from './keys';

export function useBudgets(month: string) {
  const api = useApi();
  return useQuery({
    queryKey: keys.budgets(month),
    queryFn: async () => unwrap(await api.client.GET('/budgets', { params: { query: { month } } })),
  });
}

/** Sets a category's monthly budget; 0 removes it. */
export function useSetBudget() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { categoryId: string; amountCents: number }) =>
      unwrap(await api.client.PUT('/budgets', { body })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: keys.insights });
    },
  });
}

export function useInsights() {
  const api = useApi();
  return useQuery({ queryKey: keys.insights, queryFn: async () => unwrap(await api.client.GET('/insights')) });
}

export function useDismissInsight() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.client.POST('/insights/{id}/dismiss', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.insights }),
  });
}
