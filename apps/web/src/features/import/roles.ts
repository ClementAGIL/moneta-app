// Column roles ↔ Mapping: the wizard shows one role per column; changing a role rewrites the mapping.
import type { Mapping } from '@moneta/shared';

export type Role = 'ignore' | 'date' | 'amount' | 'debit' | 'credit' | 'label';

export const ROLES: Role[] = ['ignore', 'date', 'amount', 'debit', 'credit', 'label'];

export function roleOf(m: Mapping, col: number): Role {
  if (m.dateCol === col) return 'date';
  if (m.amountMode === 'single' && m.amountCol === col) return 'amount';
  if (m.amountMode === 'debit_credit' && m.debitCol === col) return 'debit';
  if (m.amountMode === 'debit_credit' && m.creditCol === col) return 'credit';
  if (m.labelCols.includes(col)) return 'label';
  return 'ignore';
}

/** Returns the mapping with column `col` given `role` (single roles move from their previous column). */
export function setRole(m: Mapping, col: number, role: Role): Mapping {
  const next: Mapping = { ...clearColumn(m, col) };
  switch (role) {
    case 'date':
      return { ...next, dateCol: col };
    case 'amount':
      return { ...next, amountMode: 'single', amountCol: col };
    case 'debit':
      return { ...next, amountMode: 'debit_credit', debitCol: col };
    case 'credit':
      return { ...next, amountMode: 'debit_credit', creditCol: col };
    case 'label':
      return { ...next, labelCols: [...next.labelCols, col].sort((a, b) => a - b) };
    default:
      return next;
  }
}

function clearColumn(m: Mapping, col: number): Mapping {
  const clear = (c: number) => (c === col ? -1 : c);
  return {
    ...m,
    dateCol: clear(m.dateCol),
    amountCol: clear(m.amountCol),
    debitCol: clear(m.debitCol),
    creditCol: clear(m.creditCol),
    labelCols: m.labelCols.filter((c) => c !== col),
  };
}

/** True when the mapping has every role the API requires. */
export function isComplete(m: Mapping): boolean {
  const amountOk = m.amountMode === 'single' ? m.amountCol >= 0 : m.debitCol >= 0 && m.creditCol >= 0;
  return m.dateCol >= 0 && amountOk && m.labelCols.length > 0 && m.dateFormat !== '';
}
