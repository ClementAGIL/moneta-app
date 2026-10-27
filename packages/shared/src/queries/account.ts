// Hooks for account settings, saved import formats and account deletion.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../api/client';
import { useApi } from '../api/context';
import { keys } from './keys';

export function useProfiles() {
  const api = useApi();
  return useQuery({ queryKey: keys.profiles, queryFn: async () => unwrap(await api.client.GET('/import-profiles')) });
}

export function useDeleteProfile() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.client.DELETE('/import-profiles/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.profiles }),
  });
}

export function useUpdateMe() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { locale?: 'fr' | 'en'; currentPassword?: string; newPassword?: string }) =>
      unwrap(await api.client.PATCH('/me', { body })),
    onSuccess: (me) => qc.setQueryData(keys.me, me),
  });
}

/** Deletes the account for good; the caller then signs out locally. */
export function useDeleteMe() {
  const api = useApi();
  return useMutation({
    mutationFn: async (password: string) => unwrap(await api.client.DELETE('/me', { body: { password } })),
  });
}
