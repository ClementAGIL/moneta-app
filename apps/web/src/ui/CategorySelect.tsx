// Category picker: parents and their indented children, optionally with an "uncategorized" entry ("" value).
import type { SelectHTMLAttributes } from 'react';
import type { Category } from '@moneta/shared';
import { t } from '../strings';
import { Select } from './kit';

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  categories: Category[];
  allowNone?: boolean;
  noneLabel?: string;
  onlyParents?: boolean;
}

export function CategorySelect({ categories, allowNone, noneLabel, onlyParents, ...rest }: Props) {
  const shown = onlyParents ? categories.filter((c) => !c.parentId) : categories;
  return (
    <Select {...rest}>
      {allowNone && <option value="">{noneLabel ?? t.common.uncategorized}</option>}
      {shown.map((c) => (
        <option key={c.id} value={c.id}>
          {c.parentId ? `   ${c.name}` : c.name}
        </option>
      ))}
    </Select>
  );
}
