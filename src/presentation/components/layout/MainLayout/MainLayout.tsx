/**
 * MainLayout Component - Main application layout with header and optional sidebar
 */
import { useState, useCallback, type FC, type ReactNode } from 'react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './MainLayout.module.css';

export interface MainLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Current trip name (shows in header) */
  tripName?: string;
  /** Whether to show the sidebar */
  showSidebar?: boolean;
  /** Whether to show header navigation */
  showNav?: boolean;
}

export const MainLayout: FC<MainLayoutProps> = ({
  children,
  tripName,
  showSidebar = false,
  showNav = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className={styles.layout}>
      <Header
        tripName={tripName}
        showNav={showNav}
        onToggleSidebar={showSidebar ? handleToggleSidebar : undefined}
      />
      <div className={styles.body}>
        {showSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
          />
        )}
        <main className={`${styles.main} ${showSidebar ? styles.withSidebar : ''}`}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
