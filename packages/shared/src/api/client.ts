// API client shared by web and mobile: typed openapi-fetch client over a fetch that adds the access token and, on a
// 401, refreshes the session once (concurrent requests share the same refresh) and retries.
import createClient from 'openapi-fetch';
import type { paths } from './schema';
import type { ErrorBody, Tokens } from './types';

const API_PREFIX = '/api/v1';

/** Where tokens live: web keeps the access token in memory (refresh = HttpOnly cookie), mobile in secure storage. */
export interface TokenStore {
  client: 'web' | 'mobile';
  getAccess(): string | null;
  setAccess(token: string | null): void;
  /** Mobile only: the refresh token is sent in the body. */
  getRefresh?(): Promise<string | null>;
  setRefresh?(token: string | null): Promise<void>;
}

/** An error response from the API. `fields` holds per-field validation messages. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export type Api = ReturnType<typeof createApi>;

/**
 * Creates the API for a base URL ('' = same origin on the web). `onSessionEnd` runs when the refresh fails, so the
 * app can go back to the login screen.
 */
export function createApi(baseUrl: string, tokens: TokenStore, onSessionEnd: () => void) {
  let refreshing: Promise<boolean> | null = null;

  async function refresh(): Promise<boolean> {
    refreshing ??= doRefresh().finally(() => (refreshing = null));
    return refreshing;
  }

  async function doRefresh(): Promise<boolean> {
    const refreshToken = (await tokens.getRefresh?.()) ?? undefined;
    const res = await fetch(`${baseUrl}${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, client: tokens.client }),
    }).catch(() => null);
    if (!res?.ok) {
      tokens.setAccess(null);
      await tokens.setRefresh?.(null);
      onSessionEnd();
      return false;
    }
    await saveTokens(tokens, (await res.json()) as Tokens);
    return true;
  }

  async function authFetch(input: Request): Promise<Response> {
    const send = (req: Request) => {
      const access = tokens.getAccess();
      if (access) req.headers.set('Authorization', `Bearer ${access}`);
      return fetch(req);
    };
    const res = await send(input.clone());
    if (res.status !== 401 || input.url.includes('/auth/')) return res;
    return (await refresh()) ? send(input) : res;
  }

  const client = createClient<paths>({
    baseUrl: `${baseUrl}${API_PREFIX}`,
    credentials: 'include',
    fetch: authFetch,
  });

  return {
    client,
    refresh,
    /** Raw authenticated fetch on an API path (used for multipart uploads). */
    fetch: (path: string, init?: RequestInit) => authFetch(new Request(`${baseUrl}${API_PREFIX}${path}`, init)),
  };
}

/** Stores the tokens of a login/refresh response. */
export async function saveTokens(tokens: TokenStore, body: Tokens): Promise<void> {
  tokens.setAccess(body.accessToken);
  if (body.refreshToken) await tokens.setRefresh?.(body.refreshToken);
}

/** Returns data or throws an ApiError: `unwrap(await api.client.GET('/me'))`. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.response.status, result.error as ErrorBody | undefined);
  }
  return result.data as T;
}

export function toApiError(status: number, body: ErrorBody | undefined): ApiError {
  const e = body?.error;
  return new ApiError(status, e?.code ?? 'internal', e?.message ?? `HTTP ${status}`, e?.fields ?? {});
}

/** True when the API at `baseUrl` ('' = same origin) answers its health check. */
export async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
