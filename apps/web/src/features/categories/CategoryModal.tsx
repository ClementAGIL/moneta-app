// Create or edit a category: name, parent (two levels), kind (top level only), color, excluded from stats.
import { useState, type FormEvent } from 'react';
import { useDeleteCategory, useSaveCategory, type Category } from '@moneta/shared';
import { t } from '../../strings';
import { CategorySelect } from '../../ui/CategorySelect';
import { Button, ErrorText, Field, Input, Select, fieldError } from '../../ui/kit';
import { Modal } from '../../ui/Modal';
import s from './categories.module.css';

const KINDS = ['expense', 'income', 'transfer'] as const;
const DEFAULT_COLOR = '#6B7280';

interface Props {
  category?: Category;
  categories: Category[];
  onClose(): void;
}

export function CategoryModal({ category, categories, onClose }: Props) {
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const [name, setName] = useState(category?.name ?? '');
  const [parentId, setParentId] = useState(category?.parentId ?? '');
  const [kind, setKind] = useState<Category['kind']>(category?.kind ?? 'expense');
  const [color, setColor] = useState(category?.color ?? DEFAULT_COLOR);
  const [excluded, setExcluded] = useState(category?.excludedFromStats ?? false);
  const parents = categories.filter((c) => !c.parentId && c.id !== category?.id);

  function submit(e: FormEvent) {
    e.preventDefault();
    const input = { name, parentId: parentId || null, kind, color, icon: category?.icon, excludedFromStats: excluded };
    save.mutate({ id: category?.id, input }, { onSuccess: onClose });
  }

  function onDelete() {
    if (category && confirm(t.categories.deleteConfirm)) remove.mutate(category.id, { onSuccess: onClose });
  }

  return (
    <Modal open title={category ? category.name : t.categories.newCategory} onClose={onClose}>
      <form className={s.form} onSubmit={submit}>
        <Field label={t.categories.name} error={fieldError(save.error, 'name')}>
          <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t.categories.parent} error={fieldError(save.error, 'parentId')}>
          <CategorySelect
            categories={parents}
            allowNone
            noneLabel={t.categories.none}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />
        </Field>
        {!parentId && (
          <Field label={t.categories.kind}>
            <Select value={kind} onChange={(e) => setKind(e.target.value as Category['kind'])}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t.categories.kinds[k]}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label={t.categories.color}>
          <input type="color" className={s.color} value={color} onChange={(e) => setColor(e.target.value)} />
        </Field>
        <label className={s.check}>
          <input type="checkbox" checked={excluded} onChange={(e) => setExcluded(e.target.checked)} />
          {t.categories.excluded}
        </label>
        <ErrorText error={save.error ?? remove.error} />
        <div className={s.actions}>
          {category && category.key !== 'transfers' && (
            <Button variant="danger" onClick={onDelete}>
              {t.common.delete}
            </Button>
          )}
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
