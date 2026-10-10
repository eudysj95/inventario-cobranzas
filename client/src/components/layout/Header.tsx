import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../api/config';
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
}

const ICONS = {
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
  // Nexo logo monogram (green gradient N mark)
  logoMark: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" role="img" aria-label="Nexo">
      <defs>
        <linearGradient id="nexoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <path d="M6 22V6h4l8 16h4V6h4" stroke="url(#nexoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
};

export default function Header({
  breadcrumbs,
  userName,
  userRole,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const { data: config } = useConfig();
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

const businessName = config?.businessName ?? 'Nexo';
  const logoUrl = config?.logoUrl ?? '/logo-nexo.png';

  // Notification count for badge (mock for now - would come from API)
  const notificationCount = 3;

  return (
    <header className="header" data-testid="header" role="banner" style={{ height: 'var(--header-height)' }}>
      <div className="header-inner">
        {/* Left: Mobile menu button + Sidebar toggle + Logo (mobile centered) + Breadcrumbs */}
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
                <span className="user-avatar-wrapper" aria-hidden="true">
                  <span className="user-avatar">
                    {ICONS.user}
                  </span>
                  {/* Notification badge */}
                  {notificationCount > 0 && (
                    <span className="notification-badge" aria-label={`${notificationCount} notificaciones`}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
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