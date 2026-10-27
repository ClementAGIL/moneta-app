// Past imports with their status; a committed import can be undone (its transactions are deleted).
import { formatDate, useDeleteImport, useImports } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card } from '../../ui/kit';
import s from './import.module.css';

export function ImportHistory() {
  const imports = useImports();
  const remove = useDeleteImport();
  const shown = imports.data?.filter((i) => i.status === 'committed' || i.status === 'cancelled') ?? [];
  if (shown.length === 0) return null;

  return (
    <Card title={t.import.history} className={s.history}>
      <ul>
        {shown.map((i) => (
          <li key={i.id}>
            <span>
              <strong>{i.fileName}</strong>
              <small>
                {t.import.statuses[i.status]} · {i.rowsNew} · {formatDate(i.createdAt.slice(0, 10))}
                {i.periodStart && i.periodEnd && ` · ${formatDate(i.periodStart)} → ${formatDate(i.periodEnd)}`}
              </small>
            </span>
            {i.status === 'committed' && (
              <Button small variant="ghost" onClick={() => confirm(t.import.undoConfirm) && remove.mutate(i.id)}>
                {t.import.undo}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
