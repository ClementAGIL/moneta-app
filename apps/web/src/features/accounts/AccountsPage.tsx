// Banks and their accounts: create, edit, delete; each account shows its computed balance.
import { useState } from 'react';
import { useAccounts, useBanks, useDeleteBank, type Account, type Bank } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card, EmptyState, ErrorText, PageHeader, Spinner } from '../../ui/kit';
import { Money } from '../../ui/Money';
import { AccountModal } from './AccountModal';
import { BankModal } from './BankModal';
import s from './accounts.module.css';

type Editing = { bank: Bank; account?: Account } | null;

export function AccountsPage() {
  const banks = useBanks();
  const accounts = useAccounts();
  const deleteBank = useDeleteBank();
  const [bankOpen, setBankOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);

  if (banks.isPending || accounts.isPending) return <Spinner />;
  if (banks.error || accounts.error) return <ErrorText error={banks.error ?? accounts.error} />;

  return (
    <>
      <PageHeader title={t.accounts.title}>
        <Button onClick={() => setBankOpen(true)}>{t.accounts.newBank}</Button>
      </PageHeader>
      {banks.data.length === 0 && <EmptyState title={t.accounts.emptyTitle} text={t.accounts.emptyText} />}
      <div className={s.banks}>
        {banks.data.map((bank) => (
          <Card key={bank.id}>
            <div className={s.bankHeader}>
              <h2>{bank.name}</h2>
              <div className={s.actions}>
                <Button small variant="secondary" onClick={() => setEditing({ bank })}>
                  {t.accounts.newAccount}
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => confirm(t.accounts.deleteBank) && deleteBank.mutate(bank.id)}
                >
                  {t.common.delete}
                </Button>
              </div>
            </div>
            <ul className={s.accounts}>
              {accounts.data
                .filter((a) => a.bankId === bank.id)
                .map((account) => (
                  <li key={account.id}>
                    <button type="button" className={s.account} onClick={() => setEditing({ bank, account })}>
                      <span>
                        <strong>{account.name}</strong>
                        <small>{t.accounts.kinds[account.kind]}</small>
                      </span>
                      <Money cents={account.balanceCents} />
                    </button>
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>
      <BankModal open={bankOpen} onClose={() => setBankOpen(false)} />
      {editing && <AccountModal bank={editing.bank} account={editing.account} onClose={() => setEditing(null)} />}
    </>
  );
}
