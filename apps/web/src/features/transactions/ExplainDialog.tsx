// "Why this category?": the rule, keyword or model words behind an automatic categorization.
import { formatPercent, useExplanation, type Category, type Transaction } from '@moneta/shared';
import { t } from '../../strings';
import { Button, ErrorText, Spinner } from '../../ui/kit';
import { Modal } from '../../ui/Modal';

interface Props {
  txn: Transaction;
  categories: Category[];
  onClose(): void;
}

export function ExplainDialog({ txn, categories, onClose }: Props) {
  const explanation = useExplanation(txn.id);
  const category = categories.find((c) => c.id === txn.categoryId)?.name ?? t.common.uncategorized;
  const e = explanation.data;
  const source = (e?.source ?? null) as keyof typeof t.explain.sources | null;

  return (
    <Modal open title={t.explain.title(category)} onClose={onClose} actions={<Button onClick={onClose}>OK</Button>}>
      {explanation.isPending && <Spinner />}
      <ErrorText error={explanation.error} />
      {e && (
        <>
          <p>{source ? t.explain.sources[source] : t.explain.none}</p>
          {e.reasons.length > 0 && (
            <p>
              <strong>{e.reasons.join(', ')}</strong>
            </p>
          )}
          {source === 'model' && txn.confidence !== null && (
            <p>{t.explain.confidence(formatPercent(txn.confidence))}</p>
          )}
        </>
      )}
    </Modal>
  );
}
