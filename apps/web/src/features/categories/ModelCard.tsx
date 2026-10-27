// Categorization model status: progress to activation, holdout accuracy, retrain.
import { formatPercent, useModelStatus, useRetrainModel } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card, ErrorText } from '../../ui/kit';
import s from './categories.module.css';

export function ModelCard() {
  const status = useModelStatus();
  const retrain = useRetrainModel();
  const m = status.data;
  if (!m) return <ErrorText error={status.error} />;

  return (
    <Card title={t.model.title}>
      <p className={s.help}>{t.model.help}</p>
      <p>
        <strong>{m.active ? t.model.active : t.model.inactive}</strong>
      </p>
      {!m.active && m.samples < m.minSamples && <p>{t.model.progress(m.samples, m.minSamples)}</p>}
      {m.tested > 0 && <p>{t.model.accuracy(formatPercent(m.accuracy), m.tested)}</p>}
      {m.userTested > 0 && (
        <p className={s.help}>{t.model.versusRules(formatPercent(m.modelOnUser), formatPercent(m.rulesOnUser))}</p>
      )}
      <Button variant="secondary" small disabled={retrain.isPending} onClick={() => retrain.mutate()}>
        {t.model.retrain}
      </Button>
    </Card>
  );
}
