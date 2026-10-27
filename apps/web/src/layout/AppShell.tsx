// App frame: sidebar navigation on desktop, bottom bar on narrow screens; pages render in the outlet.
import { NavLink, Outlet } from 'react-router';
import { useSession } from '../auth/session';
import { t } from '../strings';
import s from './AppShell.module.css';

const LINKS = [
  { to: '/', label: t.nav.dashboard, icon: '◔' },
  { to: '/transactions', label: t.nav.transactions, icon: '≡' },
  { to: '/import', label: t.nav.import, icon: '⇪' },
  { to: '/recurring', label: t.nav.recurring, icon: '↻' },
  { to: '/accounts', label: t.nav.accounts, icon: '▣' },
  { to: '/categories', label: t.nav.categories, icon: '◉' },
];

export function AppShell() {
  const { signOut } = useSession();
  return (
    <div className={s.shell}>
      <nav className={s.nav}>
        <div className={s.brand}>Moneta</div>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end className={({ isActive }) => (isActive ? s.active : s.link)}>
            <span className={s.icon} aria-hidden>
              {link.icon}
            </span>
            <span className={s.label}>{link.label}</span>
          </NavLink>
        ))}
        <button type="button" className={s.signOut} onClick={() => signOut()}>
          {t.nav.signOut}
        </button>
      </nav>
      <main className={s.main}>
        <Outlet />
      </main>
    </div>
  );
}
