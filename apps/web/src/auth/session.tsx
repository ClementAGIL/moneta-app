// Session state: on load, try the refresh cookie; expose sign in / sign up / sign out to the pages.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signIn, signOut } from '@moneta/shared';
import { api, onSessionEnd, tokens } from '../api';

type Status = 'loading' | 'signedIn' | 'signedOut';

interface Session {
  status: Status;
  signIn(mode: 'login' | 'register', email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const queryClient = useQueryClient();

  useEffect(() => {
    api.refresh().then((ok) => setStatus(ok ? 'signedIn' : 'signedOut'));
    return onSessionEnd(() => setStatus('signedOut'));
  }, []);

  const doSignIn = useCallback(async (mode: 'login' | 'register', email: string, password: string) => {
    await signIn(api, tokens, mode, email, password);
    setStatus('signedIn');
  }, []);

  const doSignOut = useCallback(async () => {
    await signOut(api, tokens);
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  const value = useMemo(() => ({ status, signIn: doSignIn, signOut: doSignOut }), [status, doSignIn, doSignOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
