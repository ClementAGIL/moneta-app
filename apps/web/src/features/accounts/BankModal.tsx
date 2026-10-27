// Create-a-bank dialog.
import { useState, type FormEvent } from 'react';
import { useCreateBank } from '@moneta/shared';
import { t } from '../../strings';
import { Button, ErrorText, Field, Input, fieldError } from '../../ui/kit';
import { Modal } from '../../ui/Modal';

const FORM_ID = 'bank-form';

export function BankModal({ open, onClose }: { open: boolean; onClose(): void }) {
  const [name, setName] = useState('');
  const create = useCreateBank();

  function close() {
    setName('');
    create.reset();
    onClose();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    create.mutate(name, { onSuccess: close });
  }

  const actions = (
    <>
      <Button variant="secondary" onClick={close}>
        {t.common.cancel}
      </Button>
      <Button type="submit" form={FORM_ID} disabled={create.isPending}>
        {t.common.save}
      </Button>
    </>
  );
  return (
    <Modal open={open} title={t.accounts.newBank} onClose={close} actions={actions}>
      <form id={FORM_ID} onSubmit={submit}>
        <Field label={t.accounts.bankName} error={fieldError(create.error, 'name')}>
          <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        {!fieldError(create.error, 'name') && <ErrorText error={create.error} />}
      </form>
    </Modal>
  );
}
