// After a recategorization: apply it to this one transaction, or to the whole merchant (creates a rule).
import { t } from '../../strings';
import { Button } from '../../ui/kit';
import { Modal } from '../../ui/Modal';

interface Props {
  merchant: string;
  category: string;
  onAnswer(applyToMerchant: boolean): void;
  onCancel(): void;
}

export function ApplyRuleDialog({ merchant, category, onAnswer, onCancel }: Props) {
  const actions = (
    <>
      <Button variant="secondary" onClick={() => onAnswer(false)}>
        {t.transactions.applyNo}
      </Button>
      <Button onClick={() => onAnswer(true)}>{t.transactions.applyYes}</Button>
    </>
  );
  return (
    <Modal open title={t.transactions.applyTitle} onClose={onCancel} actions={actions}>
      <p>{t.transactions.applyText(merchant, category)}</p>
    </Modal>
  );
}
