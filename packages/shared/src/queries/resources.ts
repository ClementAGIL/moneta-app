// Hooks for the user, banks, accounts and categories.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import type { AccountInput, CategoryInput } from '../api/types';
import { keys } from './keys';

export function useMe() {
  const api = useApi();
  return useQuery({ queryKey: keys.me, queryFn: async () => unwrap(await api.client.GET('/me')) });
}

export function useBanks() {
  const api = useApi();
  return useQuery({ queryKey: keys.banks, queryFn: async () => unwrap(await api.client.GET('/banks')) });
}

export function useAccounts() {
  const api = useApi();
  return useQuery({ queryKey: keys.accounts, queryFn: async () => unwrap(await api.client.GET('/accounts')) });
}

export function useCategories() {
  const api = useApi();
  return useQuery({
    queryKey: keys.categories,
    queryFn: async () => unwrap(await api.client.GET('/categories')),
    staleTime: 5 * 60_000,
  });
}

export function useCreateBank() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => unwrap(await api.client.POST('/banks', { body: { name } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.banks }),
  });
}

export function useDeleteBank() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await api.client.DELETE('/banks/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSaveAccount() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: AccountInput }) =>
      id
        ? unwrap(await api.client.PATCH('/accounts/{id}', { params: { path: { id } }, body: input }))
        : unwrap(await api.client.POST('/accounts', { body: input })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.accounts }),
  });
}

export function useDeleteAccount() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await api.client.DELETE('/accounts/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSaveCategory() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: CategoryInput }) =>
      id
        ? unwrap(await api.client.PATCH('/categories/{id}', { params: { path: { id } }, body: input }))
        : unwrap(await api.client.POST('/categories', { body: input })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useDeleteCategory() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await api.client.DELETE('/categories/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries(),
  });
}
