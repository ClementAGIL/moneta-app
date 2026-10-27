// Placeholder home screen until routing and auth land (milestone W1); shows whether the API answers.
import { useEffect, useState } from 'react';
import { checkHealth } from '@moneta/shared';

type ApiState = 'checking' | 'up' | 'down';

const LABELS: Record<ApiState, string> = {
  checking: 'Connexion à l’API…',
  up: 'API connectée',
  down: 'API injoignable',
};

export function App() {
  const [api, setApi] = useState<ApiState>('checking');

  useEffect(() => {
    checkHealth('').then((ok) => setApi(ok ? 'up' : 'down'));
  }, []);

  return (
    <main className="home">
      <h1>Moneta</h1>
      <p>Toutes vos banques, une seule vue de vos dépenses.</p>
      <p className={`status-${api}`}>{LABELS[api]}</p>
    </main>
  );
}
