// Hooks for the import flow: upload, mapping, commit, cancel/undo, history.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toApiError, unwrap } from '../api/client';
import { useApi } from '../api/context';
import type { ErrorBody, ImportPreview, MappingRequestBody } from '../api/types';
import { keys, transactionDerived } from './keys';

/** A file to upload: a browser File/Blob on the web, or { uri, name, type } on React Native. */
export type UploadFile = Blob | { uri: string; name: string; type: string };

export function useImports() {
  const api = useApi();
  return useQuery({ queryKey: keys.imports, queryFn: async () => unwrap(await api.client.GET('/imports')) });
}

export function useImport(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.importOne(id ?? ''),
    enabled: !!id,
    queryFn: async () => unwrap(await api.client.GET('/imports/{id}', { params: { path: { id: id! } } })),
  });
}

export function useUploadImport() {
  const api = useApi();
  return useMutation({
    mutationFn: async ({ file, name }: { file: UploadFile; name: string }): Promise<ImportPreview> => {
      const form = new FormData();
      form.append('file', file as Blob, name);
      const res = await api.fetch('/imports', { method: 'POST', body: form });
      const body: unknown = await res.json();
      if (!res.ok) throw toApiError(res.status, body as ErrorBody);
      return body as ImportPreview;
    },
  });
}

export function useSetMapping() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: MappingRequestBody }) =>
      unwrap(await api.client.PUT('/imports/{id}/mapping', { params: { path: { id } }, body })),
    onSuccess: (data) => qc.setQueryData(keys.importOne(data.id), data),
  });
}

export function useCommitImport() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, keep }: { id: string; keep: number[] }) =>
      unwrap(await api.client.POST('/imports/{id}/commit', { params: { path: { id } }, body: { keep } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.imports });
      transactionDerived.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    },
  });
}

export function useDeleteImport() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await api.client.DELETE('/imports/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.imports });
      transactionDerived.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    },
  });
}
