// Modal dialog on the native <dialog> element (focus trap, Escape and backdrop come with it).
import { useEffect, useRef, type ReactNode } from 'react';
import s from './ui.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({ open, title, onClose, children, actions }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={s.modal} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <h2>{title}</h2>
      {children}
      {actions && <div className={s.modalActions}>{actions}</div>}
    </dialog>
  );
}
