// Create or edit an account: name, kind, and the "balance on a date" every balance is computed from.
import { useState, type FormEvent } from 'react';
import {
  centsToInput,
  parseAmountInput,
  useDeleteAccount,
  useSaveAccount,
  type Account,
  type AccountKind,
  type Bank,
} from '@moneta/shared';
import { t } from '../../strings';
import { Button, ErrorText, Field, Input, Select, fieldError } from '../../ui/kit';
import { Modal } from '../../ui/Modal';
import s from './accounts.module.css';

const KINDS: AccountKind[] = ['current', 'card', 'savings', 'other'];

interface Props {
  bank: Bank;
  account?: Account;
  onClose(): void;
}

export function AccountModal({ bank, account, onClose }: Props) {
  const save = useSaveAccount();
  const remove = useDeleteAccount();
  const [name, setName] = useState(account?.name ?? '');
  const [kind, setKind] = useState<AccountKind>(account?.kind ?? 'current');
  const [balance, setBalance] = useState(centsToInput(account?.anchorBalanceCents ?? 0));
  const [date, setDate] = useState(account?.anchorDate ?? new Date().toISOString().slice(0, 10));
  const cents = parseAmountInput(balance);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (cents === null) return;
    const input = { bankId: bank.id, name, kind, anchorBalanceCents: cents, anchorDate: date };
    save.mutate({ id: account?.id, input }, { onSuccess: onClose });
  }

  function onDelete() {
    if (account && confirm(t.accounts.deleteAccount)) remove.mutate(account.id, { onSuccess: onClose });
  }

  return (
    <Modal open title={`${account ? t.accounts.editAccount : t.accounts.newAccount} · ${bank.name}`} onClose={onClose}>
      <form className={s.form} onSubmit={submit}>
        <Field label={t.accounts.accountName} error={fieldError(save.error, 'name')}>
          <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t.accounts.kind}>
          <Select value={kind} onChange={(e) => setKind(e.target.value as AccountKind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t.accounts.kinds[k]}
              </option>
            ))}
          </Select>
        </Field>
        <div className={s.row}>
          <Field label={t.accounts.anchorBalance} error={cents === null ? '12,34' : undefined}>
            <Input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </Field>
          <Field label={t.accounts.anchorDate} error={fieldError(save.error, 'anchorDate')}>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <small className={s.help}>{t.accounts.anchorHelp}</small>
        <ErrorText error={save.error && !fieldError(save.error, 'name') ? save.error : remove.error} />
        <div className={s.modalActions}>
          {account && (
            <Button variant="danger" onClick={onDelete}>
              {t.common.delete}
            </Button>
          )}
          <span className={s.spacer} />
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={save.isPending || cents === null}>
            {t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
