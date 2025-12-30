/**
 * Header Component - Main application header with navigation
 */
import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Current trip name (if in trip context) */
  tripName?: string;
  /** Whether to show navigation */
  showNav?: boolean;
  /** Callback to toggle sidebar */
  onToggleSidebar?: () => void;
}

export const Header: FC<HeaderProps> = ({
  tripName,
  showNav = true,
  onToggleSidebar,
}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          {onToggleSidebar && (
            <button
              type="button"
              className={styles.menuButton}
              onClick={onToggleSidebar}
              aria-label="Abrir menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          )}
          <Link to="/" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM12 8v8m-4-4h8" />
            </svg>
            <span className={styles.logoText}>TripFood</span>
          </Link>
          {tripName && (
            <div className={styles.tripBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span>{tripName}</span>
            </div>
          )}
        </div>

        {showNav && (
          <nav className={styles.nav} aria-label="Navegacion principal">
            <Link
              to="/"
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              Inicio
            </Link>
            <Link
              to="/trips"
              className={`${styles.navLink} ${location.pathname.startsWith('/trips') ? styles.active : ''}`}
            >
              Viajes
            </Link>
          </nav>
        )}

        <div className={styles.right}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Configuracion"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
