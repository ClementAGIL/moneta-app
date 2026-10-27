// One budget: category, progress bar (warning from 80 %, alert above 100 %), editable amount, remove.
import { useState } from 'react';
import { formatMoney, parseAmountInput, type Budget, type Category } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Input } from '../../ui/kit';
import { CategoryBadge } from '../../ui/Money';
import s from './budgets.module.css';

const WARN_RATIO = 0.8;

interface Props {
  budget: Budget;
  category: Category | undefined;
  initial: string;
  onSave(amountCents: number): void;
}

export function BudgetRow({ budget, category, initial, onSave }: Props) {
  const [value, setValue] = useState(initial);
  const cents = parseAmountInput(value);
  const level = budget.ratio > 1 ? s.over : budget.ratio >= WARN_RATIO ? s.near : s.ok;

  return (
    <li className={s.row}>
      <div className={s.head}>
        <CategoryBadge category={category} />
        <span className={s.figures}>
          {formatMoney(budget.spentCents)} / {formatMoney(budget.amountCents)}
        </span>
      </div>
      <div className={s.track}>
        <div className={`${s.fill} ${level}`} style={{ width: `${Math.min(budget.ratio, 1) * 100}%` }} />
      </div>
      <div className={s.edit}>
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => cents && cents !== budget.amountCents && onSave(cents)}
          aria-label={t.budgets.amount}
        />
        <Button small variant="ghost" onClick={() => onSave(0)}>
          {t.common.delete}
        </Button>
      </div>
    </li>
  );
}
