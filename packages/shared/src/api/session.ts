// Sign-in, sign-up and sign-out, shared by both apps (they only differ by their TokenStore).
import { saveTokens, toApiError, type Api, type TokenStore } from './client';
import type { ErrorBody, Tokens } from './types';

/** Logs in (or registers then logs in) and stores the tokens. Throws ApiError on failure. */
export async function signIn(
  api: Api,
  tokens: TokenStore,
  mode: 'login' | 'register',
  email: string,
  password: string,
): Promise<void> {
  const res = await api.fetch(`/auth/${mode}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, client: tokens.client }),
  });
  const body: unknown = await res.json();
  if (!res.ok) throw toApiError(res.status, body as ErrorBody);
  await saveTokens(tokens, body as Tokens);
}

/** Ends this device's session; local tokens are cleared even if the server is unreachable. */
export async function signOut(api: Api, tokens: TokenStore): Promise<void> {
  const refreshToken = (await tokens.getRefresh?.()) ?? undefined;
  await api
    .fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    .catch(() => undefined);
  tokens.setAccess(null);
  await tokens.setRefresh?.(null);
}
