// Step 1: pick the account and drop the bank file.
import { useEffect, useState, type DragEvent } from 'react';
import { Link } from 'react-router';
import { useAccounts, useBanks, useUploadImport, type ImportPreview } from '@moneta/shared';
import { t } from '../../strings';
import { Card, ErrorText, Field, Select, Spinner } from '../../ui/kit';
import s from './import.module.css';

const ACCEPT = '.csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

interface Props {
  onUploaded(preview: ImportPreview, accountId: string): void;
  busy: boolean;
}

export function UploadStep({ onUploaded, busy }: Props) {
  const accounts = useAccounts();
  const banks = useBanks();
  const upload = useUploadImport();
  const [accountId, setAccountId] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!accountId && accounts.data?.[0]) setAccountId(accounts.data[0].id);
  }, [accounts.data, accountId]);

  function send(file: File | undefined) {
    if (!file) return;
    upload.mutate({ file, name: file.name }, { onSuccess: (preview) => onUploaded(preview, accountId) });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    send(e.dataTransfer.files[0]);
  }

  if (accounts.isPending) return <Spinner />;
  if (!accounts.data?.length) {
    return (
      <Card>
        <p>
          {t.import.needAccount} <Link to="/accounts">{t.nav.accounts}</Link>
        </p>
      </Card>
    );
  }
  const bankName = (id: string) => banks.data?.find((b) => b.id === id)?.name ?? '';
  return (
    <Card>
      <Field label={t.import.account}>
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.data.map((a) => (
            <option key={a.id} value={a.id}>
              {bankName(a.bankId)} · {a.name}
            </option>
          ))}
        </Select>
      </Field>
      <label
        className={`${s.drop} ${dragging ? s.dragging : ''}`}
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept={ACCEPT} hidden onChange={(e) => send(e.target.files?.[0])} />
        {upload.isPending || busy ? <Spinner /> : <span>{t.import.drop}</span>}
        <strong>{t.import.choose}</strong>
      </label>
      <ErrorText error={upload.error} />
    </Card>
  );
}
