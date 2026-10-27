// Small UI kit: buttons, form fields, cards, page header, empty state, spinner and error message.
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ApiError } from '@moneta/shared';
import { t } from '../strings';
import s from './ui.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}

export function Button({ variant = 'primary', small, className, type = 'button', ...rest }: ButtonProps) {
  const classes = [s.button, s[variant], small && s.small, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...rest} />;
}

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className={s.field}>
      <span>{label}</span>
      {children}
      {error && <small className={s.fieldError}>{error}</small>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={s.input} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={s.input} {...props} />;
}

export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={[s.card, className].filter(Boolean).join(' ')}>
      {title && <h2 className={s.cardTitle}>{title}</h2>}
      {children}
    </section>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className={s.pageHeader}>
      <h1>{title}</h1>
      {children && <div>{children}</div>}
    </header>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Spinner() {
  return <div className={s.spinner} role="status" aria-label={t.common.loading} />;
}

/** Shows an error: ApiError messages as they are, anything else as a generic message. */
export function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof ApiError ? error.message : t.common.unexpectedError;
  return <p className={s.error}>{message}</p>;
}

/** Validation message for one field of an ApiError, if any. */
export function fieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fields[field] : undefined;
}
