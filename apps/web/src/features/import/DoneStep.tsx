// Step 4: what was imported, and where to go next.
import { Link } from 'react-router';
import type { ImportSummary } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card } from '../../ui/kit';
import s from './import.module.css';

export function DoneStep({ summary, onAgain }: { summary: ImportSummary; onAgain(): void }) {
  return (
    <Card>
      <p className={s.summary}>{t.import.done(summary.rowsNew)}</p>
      <div className={s.actions}>
        <Button variant="secondary" onClick={onAgain}>
          {t.import.another}
        </Button>
        <Link to="/transactions">{t.import.seeTransactions}</Link>
      </div>
    </Card>
  );
}
