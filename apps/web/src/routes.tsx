// Route table: each page is its own chunk (charts only load with the pages that use them).
import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell } from './layout/AppShell';
import { Spinner } from './ui/kit';

/** Lazy page from a module exporting it by name. */
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  const Page = lazy<ComponentType>(async () => ({ default: (await load())[name] }));
  return (
    <Suspense fallback={<Spinner />}>
      <Page />
    </Suspense>
  );
}

const dashboard = page(() => import('./features/dashboard/DashboardPage'), 'DashboardPage');

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: dashboard },
      {
        path: '/transactions',
        element: page(() => import('./features/transactions/TransactionsPage'), 'TransactionsPage'),
      },
      { path: '/import', element: page(() => import('./features/import/ImportPage'), 'ImportPage') },
      { path: '/recurring', element: page(() => import('./features/recurring/RecurringPage'), 'RecurringPage') },
      { path: '/budgets', element: page(() => import('./features/budgets/BudgetsPage'), 'BudgetsPage') },
      { path: '/accounts', element: page(() => import('./features/accounts/AccountsPage'), 'AccountsPage') },
      { path: '/categories', element: page(() => import('./features/categories/CategoriesPage'), 'CategoriesPage') },
      { path: '/settings', element: page(() => import('./features/settings/SettingsPage'), 'SettingsPage') },
      { path: '*', element: dashboard },
    ],
  },
]);
