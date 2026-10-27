// Login / sign-up page (one form, two modes).
import { useState, type FormEvent } from 'react';
import { useSession } from '../../auth/session';
import { t } from '../../strings';
import { Button, ErrorText, Field, Input, fieldError } from '../../ui/kit';
import s from './AuthPage.module.css';

export function AuthPage() {
  const { signIn } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(mode, email, password);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';
  return (
    <main className={s.page}>
      <form className={s.form} onSubmit={submit}>
        <h1 className={s.brand}>Moneta</h1>
        <p className={s.tagline}>{t.auth.tagline}</p>
        <Field label={t.auth.email} error={fieldError(error, 'email')}>
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t.auth.password} error={fieldError(error, 'password')}>
          <Input
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            minLength={isLogin ? undefined : 10}
            placeholder={isLogin ? undefined : t.auth.passwordHint}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {!fieldError(error, 'email') && !fieldError(error, 'password') && <ErrorText error={error} />}
        <Button type="submit" disabled={busy}>
          {isLogin ? t.auth.login : t.auth.register}
        </Button>
        <Button variant="ghost" onClick={() => setMode(isLogin ? 'register' : 'login')}>
          {isLogin ? t.auth.toRegister : t.auth.toLogin}
        </Button>
      </form>
    </main>
  );
}
