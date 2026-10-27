// Hooks for the categorization model and per-transaction explanations.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';

export function useModelStatus() {
  const api = useApi();
  return useQuery({ queryKey: ['model'], queryFn: async () => unwrap(await api.client.GET('/model')) });
}

export function useRetrainModel() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await api.client.POST('/model/retrain')),
    onSuccess: () => setTimeout(() => qc.invalidateQueries({ queryKey: ['model'] }), 3000),
  });
}

/** Why a transaction has its category; fetched only when `id` is set. */
export function useExplanation(id: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ['explain', id],
    enabled: !!id,
    queryFn: async () => unwrap(await api.client.GET('/transactions/{id}/explain', { params: { path: { id: id! } } })),
  });
}
