// Chooses between the loading screen, the auth page and the router depending on the session.
import { RouterProvider } from 'react-router';
import { useSession } from './auth/session';
import { AuthPage } from './features/auth/AuthPage';
import { router } from './routes';
import { Spinner } from './ui/kit';

export function App() {
  const { status } = useSession();
  if (status === 'loading') return <Spinner />;
  if (status === 'signedOut') return <AuthPage />;
  return <RouterProvider router={router} />;
}
