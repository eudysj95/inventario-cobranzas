import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../api/config';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../components/ui/Toast';
import './Header.css';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface HeaderProps {
  breadcrumbs: BreadcrumbItem[];
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

const ICONS = {
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  monitor: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logOut: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Header({
  breadcrumbs,
  userName,
  userRole,
  onLogout,
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed,
}: HeaderProps) {
  const { data: config } = useConfig();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleThemeCycle = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    // Show toast confirmation
    const themeLabels = { light: 'claro', dark: 'oscuro', system: 'sistema' };
    toast({
      variant: 'success',
      title: 'Tema cambiado',
      description: `Modo ${themeLabels[nextTheme]}`,
    });
  };

  const getThemeIcon = () => {
    switch (resolvedTheme) {
      case 'dark':
        return ICONS.moon;
      case 'light':
        return ICONS.sun;
      default:
        return ICONS.monitor;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Modo oscuro';
      case 'light':
        return 'Modo claro';
      default:
        return 'Sistema';
    }
  };

  const businessName = config?.businessName ?? 'Nexo';
  const logoUrl = config?.logoUrl ?? '/logo-nexo.png';

  return (
    <header className="header" data-testid="header" role="banner" style={{ height: 'var(--header-height)' }}>
      <div className="header-inner">
        {/* Left: Mobile menu button + Sidebar toggle + Breadcrumbs */}
        <div className="header-left">
          {/* Mobile hamburger */}
          {onMenuClick && (
            <button
              type="button"
              className="btn btn-ghost header-menu-btn hide-desktop"
              onClick={onMenuClick}
              aria-label="Abrir menú"
              aria-expanded={false}
              aria-controls="nav-drawer"
            >
              {ICONS.menu}
            </button>
          )}

          {/* Sidebar toggle for tablet/desktop */}
          {onSidebarToggle && (
            <button
              type="button"
              className="btn btn-ghost header-sidebar-toggle hide-mobile"
              onClick={onSidebarToggle}
              aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? ICONS.chevronRight : ICONS.chevronLeft}
            </button>
          )}

          {/* Breadcrumbs */}
          <nav className="breadcrumbs" data-testid="breadcrumbs" role="navigation" aria-label="Ruta de navegación">
            <ol className="breadcrumbs-list">
              {breadcrumbs.map((item, index) => (
                <li key={item.path} className="breadcrumbs-item">
                  {index > 0 && <span className="breadcrumbs-separator" aria-hidden="true">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="breadcrumbs-current" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <NavLink to={item.path} className="breadcrumbs-link">
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Right: Global actions */}
        <div className="header-right">
          {/* Theme toggle */}
          <button
            type="button"
            className="btn btn-ghost header-theme-toggle"
            onClick={handleThemeCycle}
            aria-label={`Cambiar tema (actual: ${getThemeLabel()})`}
            title={`Tema: ${getThemeLabel()}`}
          >
            {getThemeIcon()}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="btn btn-ghost header-notifications"
            aria-label="Notificaciones"
            disabled
          >
            {ICONS.bell}
          </button>

          {/* User menu */}
          {(userName || userRole || onLogout) && (
            <div className="header-user-menu" ref={userMenuRef} data-testid="user-menu">
              <button
                type="button"
                className="btn btn-ghost header-user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menú de usuario"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
              >
                <span className="user-avatar" aria-hidden="true">
                  {ICONS.user}
                </span>
                <span className="user-name hide-mobile">{userName}</span>
                {ICONS.chevronDown}
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown" role="menu" aria-label="Opciones de usuario">
                  <div className="user-dropdown-header">
                    <span className="user-avatar-large" aria-hidden="true">
                      {ICONS.user}
                    </span>
                    <div className="user-dropdown-info">
                      {userName && <span className="user-dropdown-name">{userName}</span>}
                      {userRole && <span className="user-dropdown-role">{userRole}</span>}
                    </div>
                  </div>
                  <div className="user-dropdown-divider" role="separator" />
                  {onLogout && (
                    <button
                      type="button"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      {ICONS.logOut}
                      <span>Cerrar sesión</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

type Theme = 'light' | 'dark' | 'system';