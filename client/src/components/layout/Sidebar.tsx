import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useConfig } from '../../api/config';
import './Sidebar.css';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  inventory: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  archive: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  'credit-card': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  'shopping-cart': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  'dollar-sign': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  truck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 12H5a2 2 0 0 0-2 2v4" />
      <path d="M14 10V6.5a2.5 2.5 0 0 1 5 0V10" />
    </svg>
  ),
  banknote: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="2" y1="14" x2="22" y2="14" />
      <line x1="2" y1="18" x2="22" y2="18" />
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
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logOut: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Sidebar({
  navItems,
  userName,
  userRole,
  onLogout,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const { data: config } = useConfig();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar:collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  // Controlled vs uncontrolled
  const collapsed = controlledCollapsed ?? isCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar:collapsed', String(newCollapsed));
    onToggleCollapse?.();
  };

  // Sync focused index with active route
  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
    if (activeIndex !== -1) {
      setFocusedIndex(activeIndex);
    }
  }, [location.pathname, navItems]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, navItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(navItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        // Let the link handle navigation
        break;
      default:
        return;
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const businessName = config?.businessName ?? 'Nexo';
  const logoUrl = config?.logoUrl ?? '/logo-nexo.png';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} data-testid="sidebar" role="complementary" aria-label="Navegación principal">
      {/* Brand / Logo */}
      <div className="sidebar-brand" data-testid="sidebar-brand" aria-label={businessName}>
        <img
          src={logoUrl}
          alt={businessName}
          className="sidebar-logo"
          width="32"
          height="32"
          aria-hidden="true"
        />
        <span className="sidebar-brand-name">{businessName}</span>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={handleToggleCollapse}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
        >
          {collapsed ? ICONS.chevronRight : ICONS.chevronLeft}
        </button>
      </div>

      {/* Navigation */}
      <nav id="sidebar-nav" className="sidebar-nav" role="navigation" aria-label="Navegación principal">
        <ul className="sidebar-nav-list">
          {navItems.map((item, index) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                onFocus={() => handleFocus(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={index === focusedIndex ? 0 : -1}
              >
                <span className="nav-icon" aria-hidden="true">
                  {ICONS[item.icon] ?? ICONS.dashboard}
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Menu */}
      {(userName || userRole || onLogout) && (
        <div className="sidebar-user-menu" data-testid="user-menu" role="region" aria-label="Menú de usuario">
          <div className="user-menu-content">
            <div className="user-info">
              <span className="user-avatar" aria-hidden="true">
                {ICONS.user}
              </span>
              <div className="user-details">
                {userName && <span className="user-name">{userName}</span>}
                {userRole && <span className="user-role">{userRole}</span>}
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                className="user-logout-btn"
                onClick={onLogout}
                aria-label="Cerrar sesión"
              >
                {ICONS.logOut}
                <span className="user-menu-label">Cerrar sesión</span>
                <span className="sr-only">Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}