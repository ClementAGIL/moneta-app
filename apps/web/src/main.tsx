// Web app entry point: theme, React Query, API and session providers, then the app.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@moneta/shared';
import { api } from './api';
import { App } from './App';
import { SessionProvider } from './auth/session';
import { installTheme } from './theme';
import './index.css';

installTheme();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

const root = document.getElementById('root');
if (!root) throw new Error('#root missing in index.html');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </ApiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
