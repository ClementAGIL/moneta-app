// Settings: account (email, password), saved import formats, data export, account deletion.
import { useState, type FormEvent } from 'react';
import { useDeleteMe, useDeleteProfile, useMe, useProfiles, useUpdateMe } from '@moneta/shared';
import { api } from '../../api';
import { useSession } from '../../auth/session';
import { t } from '../../strings';
import { Button, Card, ErrorText, Field, Input, PageHeader, fieldError } from '../../ui/kit';
import s from './settings.module.css';

export function SettingsPage() {
  return (
    <>
      <PageHeader title={t.settings.title} />
      <div className={s.grid}>
        <PasswordCard />
        <ProfilesCard />
        <DataCard />
      </div>
    </>
  );
}

function PasswordCard() {
  const me = useMe();
  const update = useUpdateMe();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    update.mutate({ currentPassword: current, newPassword: next }, { onSuccess: () => (setCurrent(''), setNext('')) });
  }

  return (
    <Card title={t.settings.account}>
      <p className={s.muted}>{me.data?.email}</p>
      <form className={s.form} onSubmit={submit}>
        <Field label={t.settings.currentPassword} error={fieldError(update.error, 'currentPassword')}>
          <Input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label={t.settings.newPassword} error={fieldError(update.error, 'newPassword')}>
          <Input type="password" required minLength={10} value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        {update.isSuccess && <p className={s.ok}>{t.settings.passwordChanged}</p>}
        <Button type="submit" disabled={update.isPending}>
          {t.settings.changePassword}
        </Button>
      </form>
    </Card>
  );
}

function ProfilesCard() {
  const profiles = useProfiles();
  const remove = useDeleteProfile();
  return (
    <Card title={t.settings.profiles}>
      <p className={s.muted}>{t.settings.profilesHelp}</p>
      <ErrorText error={profiles.error ?? remove.error} />
      <ul className={s.list}>
        {profiles.data?.map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <Button small variant="ghost" onClick={() => remove.mutate(p.id)}>
              {t.settings.forget}
            </Button>
          </li>
        ))}
      </ul>
      {profiles.data?.length === 0 && <p className={s.muted}>{t.settings.noProfiles}</p>}
    </Card>
  );
}

function DataCard() {
  const { signOut } = useSession();
  const remove = useDeleteMe();
  const [error, setError] = useState<unknown>(null);
  const [password, setPassword] = useState('');

  async function download() {
    setError(null);
    const res = await api.fetch('/me/export');
    if (!res.ok) return setError(new Error(res.statusText));
    const url = URL.createObjectURL(await res.blob());
    const link = Object.assign(document.createElement('a'), { href: url, download: 'moneta-export.zip' });
    link.click();
    URL.revokeObjectURL(url);
  }

  function deleteAccount() {
    if (confirm(t.settings.deleteConfirm)) remove.mutate(password, { onSuccess: () => signOut() });
  }

  return (
    <Card title={t.settings.data}>
      <p className={s.muted}>{t.settings.exportHelp}</p>
      <Button variant="secondary" onClick={download}>
        {t.settings.export}
      </Button>
      <ErrorText error={error} />
      <hr className={s.rule} />
      <p className={s.muted}>{t.settings.deleteHelp}</p>
      <div className={s.form}>
        <Field label={t.auth.password} error={fieldError(remove.error, 'password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button variant="danger" disabled={!password || remove.isPending} onClick={deleteAccount}>
          {t.settings.delete}
        </Button>
      </div>
    </Card>
  );
}
