// Category tree (click to edit) and the categorization rules.
import { useState } from 'react';
import { useCategories, type Category } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card, ErrorText, PageHeader, Spinner } from '../../ui/kit';
import { CategoryBadge } from '../../ui/Money';
import { CategoryModal } from './CategoryModal';
import { RulesCard } from './RulesCard';
import s from './categories.module.css';

type Editing = { category?: Category } | null;

export function CategoriesPage() {
  const categories = useCategories();
  const [editing, setEditing] = useState<Editing>(null);

  if (categories.isPending) return <Spinner />;
  if (categories.error) return <ErrorText error={categories.error} />;

  return (
    <>
      <PageHeader title={t.categories.title}>
        <Button onClick={() => setEditing({})}>{t.categories.newCategory}</Button>
      </PageHeader>
      <div className={s.layout}>
        <Card>
          <ul className={s.tree}>
            {categories.data.map((c) => (
              <li key={c.id} className={c.parentId ? s.child : s.parent}>
                <button type="button" onClick={() => setEditing({ category: c })}>
                  <CategoryBadge category={c} />
                  <small>{t.categories.kinds[c.kind]}</small>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <RulesCard categories={categories.data} />
      </div>
      {editing && (
        <CategoryModal category={editing.category} categories={categories.data} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
