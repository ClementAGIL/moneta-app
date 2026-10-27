// Step 3: counts, possible duplicates side by side (keep or skip, skipped by default), rows that could not be read.
import { useState } from 'react';
import { formatDate, type ImportSummary } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card } from '../../ui/kit';
import { Money } from '../../ui/Money';
import s from './import.module.css';

interface Props {
  summary: ImportSummary;
  busy: boolean;
  onBack(): void;
  onCommit(keep: number[]): void;
}

export function ReviewStep({ summary, busy, onBack, onCommit }: Props) {
  const [keep, setKeep] = useState<Set<number>>(new Set());
  const rows = summary.rows ?? [];
  const reviews = rows.filter((r) => r.status === 'review');
  const invalid = rows.filter((r) => r.status === 'invalid');
  const toggle = (index: number) => {
    const next = new Set(keep);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setKeep(next);
  };

  return (
    <Card>
      <p className={s.summary}>
        {t.import.summary(summary.rowsNew, summary.rowsDuplicate, summary.rowsReview, summary.rowsInvalid)}
      </p>
      {reviews.length > 0 && (
        <section>
          <h3>{t.import.reviewTitle}</h3>
          <p className={s.muted}>{t.import.reviewHelp}</p>
          <ul className={s.reviews}>
            {reviews.map((r) => (
              <li key={r.index}>
                <div>
                  <strong>{r.label}</strong>
                  <small>
                    {r.date && formatDate(r.date)} · <Money cents={r.amountCents} />
                  </small>
                  {r.match && (
                    <small className={s.muted}>
                      {t.import.existing} : {r.match.label} · {formatDate(r.match.date)}
                    </small>
                  )}
                </div>
                <Button small variant={keep.has(r.index) ? 'primary' : 'secondary'} onClick={() => toggle(r.index)}>
                  {keep.has(r.index) ? t.import.keep : t.import.skip}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {invalid.length > 0 && (
        <details className={s.invalid}>
          <summary>
            {t.import.invalidTitle} ({invalid.length})
          </summary>
          <ul>
            {invalid.map((r) => (
              <li key={r.index}>
                <small>
                  {r.index + 1} · {r.error} · {r.label}
                </small>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className={s.actions}>
        <Button variant="secondary" onClick={onBack}>
          {t.common.back}
        </Button>
        <Button disabled={busy} onClick={() => onCommit([...keep])}>
          {t.import.commit(summary.rowsNew + keep.size)}
        </Button>
      </div>
    </Card>
  );
}
