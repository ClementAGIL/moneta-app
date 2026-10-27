// Query keys in one place, so invalidation after a mutation is explicit and consistent across apps.
export const keys = {
  me: ['me'] as const,
  banks: ['banks'] as const,
  accounts: ['accounts'] as const,
  categories: ['categories'] as const,
  imports: ['imports'] as const,
  importOne: (id: string) => ['imports', id] as const,
  profiles: ['import-profiles'] as const,
  transactions: ['transactions'] as const,
  transactionList: (filter: object) => ['transactions', 'list', filter] as const,
  rules: ['rules'] as const,
  recurring: ['recurring'] as const,
  stats: ['stats'] as const,
  summary: (month: string) => ['stats', 'summary', month] as const,
  series: (from: string, to: string) => ['stats', 'categories', from, to] as const,
  merchants: (from: string, to: string) => ['stats', 'merchants', from, to] as const,
};

/** Everything derived from transactions: refetch after an import, a correction or a rule change. */
export const transactionDerived = [keys.transactions, keys.stats, keys.accounts, keys.recurring] as const;
