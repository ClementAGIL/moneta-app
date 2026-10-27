// Mobile session: the home-server URL and the refresh token live in secure storage (Android Keystore), the access
// token in memory; one API instance per server URL.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { ApiProvider, createApi, signIn, signOut, type Api, type TokenStore } from '@moneta/shared';

import { API_URL } from '@/config';

const URL_KEY = 'moneta.serverUrl';
const REFRESH_KEY = 'moneta.refreshToken';

let accessToken: string | null = null;

const tokens: TokenStore = {
  client: 'mobile',
  getAccess: () => accessToken,
  setAccess: (token) => {
    accessToken = token;
  },
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setRefresh: async (token) => {
    if (token) await SecureStore.setItemAsync(REFRESH_KEY, token);
    else await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

type Status = 'loading' | 'signedIn' | 'signedOut';

interface Session {
  status: Status;
  serverUrl: string;
  signIn(mode: 'login' | 'register', email: string, password: string, serverUrl: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const api = useMemo<Api | null>(
    () => (serverUrl ? createApi(serverUrl, tokens, () => setStatus('signedOut')) : null),
    [serverUrl],
  );

  useEffect(() => {
    SecureStore.getItemAsync(URL_KEY).then((saved) => setServerUrl(saved ?? API_URL));
  }, []);

  useEffect(() => {
    if (api && status === 'loading') api.refresh().then((ok) => setStatus(ok ? 'signedIn' : 'signedOut'));
  }, [api, status]);

  const doSignIn = useCallback(async (mode: 'login' | 'register', email: string, password: string, url: string) => {
    const clean = url.trim().replace(/\/+$/, '');
    await signIn(
      createApi(clean, tokens, () => setStatus('signedOut')),
      tokens,
      mode,
      email,
      password,
    );
    await SecureStore.setItemAsync(URL_KEY, clean);
    setServerUrl(clean);
    setStatus('signedIn');
  }, []);

  const doSignOut = useCallback(async () => {
    if (api) await signOut(api, tokens);
    queryClient.clear();
    setStatus('signedOut');
  }, [api, queryClient]);

  const value = useMemo(
    () => ({ status, serverUrl: serverUrl ?? API_URL, signIn: doSignIn, signOut: doSignOut }),
    [status, serverUrl, doSignIn, doSignOut],
  );
  return (
    <SessionContext.Provider value={value}>
      {api ? <ApiProvider api={api}>{children}</ApiProvider> : null}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
