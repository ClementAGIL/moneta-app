// Categorization rules: list, create, delete. Corrections on transactions also create rules.
import { useState, type FormEvent } from 'react';
import { useDeleteRule, useRules, useSaveRule, type Category, type RuleInput } from '@moneta/shared';
import { t } from '../../strings';
import { CategorySelect } from '../../ui/CategorySelect';
import { Button, Card, ErrorText, Field, Input, Select, fieldError } from '../../ui/kit';
import { CategoryBadge } from '../../ui/Money';
import { Modal } from '../../ui/Modal';
import s from './categories.module.css';

export function RulesCard({ categories }: { categories: Category[] }) {
  const rules = useRules();
  const remove = useDeleteRule();
  const [creating, setCreating] = useState(false);
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <Card title={t.categories.rules}>
      <p className={s.help}>{t.categories.rulesHelp}</p>
      <ErrorText error={rules.error} />
      {rules.data?.length === 0 && <p className={s.help}>{t.categories.noRules}</p>}
      <ul className={s.rules}>
        {rules.data?.map((r) => (
          <li key={r.id}>
            <span>
              <strong>{r.pattern}</strong>
              <small>{t.categories.matches[r.match]}</small>
            </span>
            <CategoryBadge category={byId.get(r.categoryId)} />
            <Button small variant="ghost" onClick={() => remove.mutate(r.id)} aria-label={t.common.delete}>
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="secondary" small onClick={() => setCreating(true)}>
        {t.categories.newRule}
      </Button>
      {creating && <RuleModal categories={categories} onClose={() => setCreating(false)} />}
    </Card>
  );
}

function RuleModal({ categories, onClose }: { categories: Category[]; onClose(): void }) {
  const save = useSaveRule();
  const [rule, setRule] = useState<RuleInput>({
    pattern: '',
    match: 'contains',
    sign: 'any',
    categoryId: categories[0]?.id ?? '',
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate({ input: rule }, { onSuccess: onClose });
  }

  return (
    <Modal open title={t.categories.newRule} onClose={onClose}>
      <form className={s.form} onSubmit={submit}>
        <Field label={t.categories.pattern} error={fieldError(save.error, 'pattern')}>
          <Input
            autoFocus
            required
            value={rule.pattern}
            onChange={(e) => setRule({ ...rule, pattern: e.target.value })}
          />
        </Field>
        <Field label={t.categories.match}>
          <Select
            value={rule.match}
            onChange={(e) => setRule({ ...rule, match: e.target.value as RuleInput['match'] })}
          >
            <option value="contains">{t.categories.matches.contains}</option>
            <option value="merchant">{t.categories.matches.merchant}</option>
          </Select>
        </Field>
        <Field label={t.transactions.category}>
          <CategorySelect
            categories={categories}
            value={rule.categoryId}
            onChange={(e) => setRule({ ...rule, categoryId: e.target.value })}
          />
        </Field>
        <ErrorText error={fieldError(save.error, 'pattern') ? null : save.error} />
        <div className={s.actions}>
          <span className={s.spacer} />
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
