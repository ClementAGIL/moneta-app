// The web app's API instance: same origin (Vite proxy in dev, the Go API in production), access token in memory,
// refresh token in an HttpOnly cookie the browser sends by itself.
import { createApi, type TokenStore } from '@moneta/shared';

let accessToken: string | null = null;
const sessionEndListeners = new Set<() => void>();

export const tokens: TokenStore = {
  client: 'web',
  getAccess: () => accessToken,
  setAccess: (token) => {
    accessToken = token;
  },
};

export const api = createApi('', tokens, () => sessionEndListeners.forEach((listener) => listener()));

/** Subscribes to "the session expired"; returns the unsubscribe function. */
export function onSessionEnd(listener: () => void): () => void {
  sessionEndListeners.add(listener);
  return () => sessionEndListeners.delete(listener);
}
