import { useLocation, NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import './Breadcrumbs.css';

interface BreadcrumbsProps {
  labelMap?: Record<string, string>;
  maxItems?: number;
  showHomeIcon?: boolean;
}

const DEFAULT_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/inventory': 'Inventario',
  '/clientes': 'Clientes',
  '/apartados': 'Apartados',
  '/credit-sales': 'Venta a crédito',
  '/venta': 'Venta',
  '/cobros': 'Cobranzas',
  '/proveedores': 'Proveedores',
  '/payments': 'Pagos',
};

const HOME_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function Breadcrumbs({
  labelMap = {},
  maxItems = 5,
  showHomeIcon = false,
}: BreadcrumbsProps) {
  const location = useLocation();

  // Build breadcrumb segments from pathname
  const segments = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === '/') {
      return [{ label: labelMap['/'] ?? DEFAULT_LABELS['/'] ?? 'Inicio', path: '/', isCurrent: true }];
    }

    const parts = pathname.split('/').filter(Boolean);
    const segments: Array<{ label: string; path: string; isCurrent: boolean }> = [];

    // Always add home
    segments.push({
      label: labelMap['/'] ?? DEFAULT_LABELS['/'] ?? 'Inicio',
      path: '/',
      isCurrent: false,
    });

    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 1;

      // Get label from map or generate from path
      const label = labelMap[currentPath] ?? DEFAULT_LABELS[currentPath] ?? formatLabel(part);

      segments.push({
        label,
        path: currentPath,
        isCurrent: isLast,
      });
    });

    return segments;
  }, [location.pathname, labelMap]);

  // Truncate middle items if too many
  const visibleSegments = useMemo(() => {
    if (segments.length <= maxItems) {
      return segments;
    }

    const first = segments[0];
    const last = segments[segments.length - 1];
    const middleCount = maxItems - 2;
    const middleStart = Math.max(1, segments.length - middleCount - 1);
    const middle = segments.slice(middleStart, segments.length - 1);

    return [
      first,
      { label: '…', path: '', isCurrent: false, isEllipsis: true },
      ...middle,
      last,
    ];
  }, [segments, maxItems]);

  return (
    <nav className="breadcrumbs" data-testid="breadcrumbs" role="navigation" aria-label="Ruta de navegación">
      <ol className="breadcrumbs-list">
        {visibleSegments.map((segment, index) => (
          <li key={`${segment.path}-${index}`} className="breadcrumbs-item">
            {index > 0 && !segment.isEllipsis && (
              <span className="breadcrumbs-separator" aria-hidden="true">/</span>
            )}

            {segment.isEllipsis ? (
              <span className="breadcrumbs-ellipsis" aria-hidden="true">…</span>
            ) : segment.isCurrent ? (
              <span className="breadcrumbs-current" aria-current="page">
                {segment.label}
              </span>
            ) : (
              <NavLink
                to={segment.path}
                className="breadcrumbs-link"
                aria-current={undefined}
              >
                {showHomeIcon && index === 0 && <span className="breadcrumbs-home-icon" aria-hidden="true">{HOME_ICON}</span>}
                {segment.label}
              </NavLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function formatLabel(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}