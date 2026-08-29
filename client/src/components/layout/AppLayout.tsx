import { ReactNode } from 'react';
import './AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  sidebarClassName?: string;
}

export default function AppLayout({
  children,
  sidebar,
  header,
  sidebarClassName = '',
}: AppLayoutProps) {
  return (
    <div className="app-layout" data-testid="app-layout">
      <aside
        className={`sidebar ${sidebarClassName}`}
        data-testid="sidebar"
        role="complementary"
        aria-label="Navegación principal"
      >
        {sidebar}
      </aside>
      <header className="header" data-testid="header" role="banner">
        {header}
      </header>
      <main className="main" data-testid="main" id="main-content" role="main">
        {children}
      </main>
    </div>
  );
}