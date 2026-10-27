// Route table: the auth page when signed out, the app shell with its pages when signed in.
import { createBrowserRouter } from 'react-router';
import { AppShell } from './layout/AppShell';
import { AccountsPage } from './features/accounts/AccountsPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ImportPage } from './features/import/ImportPage';
import { RecurringPage } from './features/recurring/RecurringPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/import', element: <ImportPage /> },
      { path: '/recurring', element: <RecurringPage /> },
      { path: '/budgets', element: <BudgetsPage /> },
      { path: '/accounts', element: <AccountsPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '*', element: <DashboardPage /> },
    ],
  },
]);
