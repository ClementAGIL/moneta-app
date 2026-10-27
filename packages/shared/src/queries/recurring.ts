// Hooks for recurring series (subscriptions, bills, income) and transfer unpairing.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import { keys, transactionDerived } from './keys';

export function useRecurring() {
  const api = useApi();
  return useQuery({ queryKey: keys.recurring, queryFn: async () => unwrap(await api.client.GET('/recurring')) });
}

export function useUpdateRecurring() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ignored, subscription }: { id: string; ignored?: boolean; subscription?: boolean }) =>
      unwrap(await api.client.PATCH('/recurring/{id}', { params: { path: { id } }, body: { ignored, subscription } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.recurring }),
  });
}

export function useUnpairTransfer() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.client.DELETE('/transactions/{id}/transfer', { params: { path: { id } } })),
    onSuccess: () => transactionDerived.forEach((queryKey) => qc.invalidateQueries({ queryKey })),
  });
}
