// Hooks for transactions (infinite list, edit) and rules.
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import type { RuleInput, TransactionUpdate } from '../api/types';
import { keys, transactionDerived } from './keys';

export interface TransactionFilter {
  account?: string;
  category?: string;
  uncategorized?: boolean;
  from?: string;
  to?: string;
  q?: string;
}

const PAGE_SIZE = 50;

export function useTransactions(filter: TransactionFilter) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.transactionList(filter),
    initialPageParam: '',
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.client.GET('/transactions', {
          params: { query: { ...filter, limit: PAGE_SIZE, cursor: pageParam || undefined } },
        }),
      ),
    getNextPageParam: (last) => last.next || undefined,
  });
}

export function useEditTransaction() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: TransactionUpdate }) =>
      unwrap(await api.client.PATCH('/transactions/{id}', { params: { path: { id } }, body: update })),
    onSuccess: (_, { update }) => {
      transactionDerived.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
      if (update.applyToMerchant) qc.invalidateQueries({ queryKey: keys.rules });
    },
  });
}

export function useRules() {
  const api = useApi();
  return useQuery({ queryKey: keys.rules, queryFn: async () => unwrap(await api.client.GET('/rules')) });
}

export function useSaveRule() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: RuleInput }) =>
      id
        ? unwrap(await api.client.PATCH('/rules/{id}', { params: { path: { id } }, body: input }))
        : unwrap(await api.client.POST('/rules', { body: input })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rules }),
  });
}

export function useDeleteRule() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await api.client.DELETE('/rules/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rules }),
  });
}
