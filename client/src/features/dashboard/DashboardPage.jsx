// Dashboard page — ultra-compact single-screen overview.
// Everything fits in one viewport without scroll.
// Nexo design system: ultra-tight grid, minimal cards, micro charts via MicroCharts primitives.

import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useDashboardStats } from '../../api/dashboard.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { MicroLineChart, MicroBarChart, MicroAreaChart } from './MicroCharts';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { Skeleton } from '../../components/ui/Skeleton';

export default function DashboardPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { data, isPending, isError, refetch } = useDashboardStats();

  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Pull-to-refresh for mobile
  const { isPulling, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      setRefreshKey(k => k + 1);
    },
    threshold: 60,
  });

  const handleRefresh = useCallback(() => {
    refetch();
    setRefreshKey(k => k + 1);
  }, [refetch]);

  if (isPending) return <DashboardSkeleton />;
  if (isError) return <DashboardError onRetry={() => refetch()} />;

  const stats = data ?? {};

  return (
    <section
      data-testid="dashboard-root"
      data-density="compact"
      className="dashboard-root"
      style={{
        padding: 'var(--dash-space-2) 0',
        maxHeight: 'calc(100vh - var(--space-8))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 'var(--dash-space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: 'var(--dash-text-base)',
            fontWeight: 600,
            zIndex: 100,
            transform: `translateY(${isPulling ? Math.min(pullDistance * 0.5, 30) : 0}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {isRefreshing ? (
            <span>Actualizando... <Skeleton variant="circular" width="12px" height="12px" className="inline-block ml-1" /></span>
          ) : (
            `Suelta para actualizar (${Math.round(pullDistance)}px)`
          )}
        </div>
      )}

      <header className="flex items-center justify-between gap-1 mb-2 flex-wrap" style={{ alignItems: 'center' }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--dash-text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Dashboard
          </h1>
          <p className="form-hint" style={{ marginTop: '0', fontSize: '10px', lineHeight: 1 }}>
            Actualizado {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={isPending || isRefreshing}
          style={{ padding: '2px 8px', fontSize: '9px', minHeight: '24px' }}
        >
          ⟳
        </button>
      </header>

      {/* KPI Cards Row - 4 cards */}
      <div data-testid="kpi-row" className="grid grid-cols-2 lg:grid-cols-4 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        <MicroKPI title="Ventas hoy" value={formatCurrency(stats.sales?.today ?? 0, config)} subtitle={`Ef ${formatCurrency(stats.sales?.cashToday ?? 0, config)} · Cr ${formatCurrency(stats.sales?.creditToday ?? 0, config)}`} icon="💰" trend={stats.sales?.today > 0 ? 'up' : 'neutral'} />
        <MicroKPI title="Stock bajo" value={stats.inventory?.lowStock ?? 0} subtitle={`${stats.inventory?.outOfStock ?? 0} sin · Tot ${formatCurrency(stats.inventory?.totalValue ?? 0, config)}`} icon="📦" trend={stats.inventory?.lowStock > 0 ? 'down' : 'up'} />
        <MicroKPI title="Cobrar urg" value={stats.collections?.overdueToday ?? 0} subtitle={`+3d ${stats.collections?.dueNext3Days ?? 0} · S/tel ${stats.collections?.withoutPhone ?? 0}`} icon="📞" trend={stats.collections?.overdueToday > 0 ? 'down' : 'up'} />
        <MicroKPI title="Proveedores" value={stats.suppliers?.overdue ?? 0} subtitle={`+7d ${stats.suppliers?.dueNext7Days ?? 0} · Ab ${stats.suppliers?.openDebts ?? 0}`} icon="🏪" trend={stats.suppliers?.overdue > 0 ? 'down' : 'up'} />
      </div>

      {/* Charts Row - 2 mini charts using new primitives */}
      <div data-testid="charts-row" className="grid grid-cols-1 lg:grid-cols-2 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        <MicroCard title="Ventas 7d" $chart>
          <MicroAreaChart
            data={[
              { day: 'Lun', cash: 12000, credit: 8000 },
              { day: 'Mar', cash: 18000, credit: 12000 },
              { day: 'Mié', cash: 15000, credit: 9000 },
              { day: 'Jue', cash: 22000, credit: 15000 },
              { day: 'Vie', cash: 25000, credit: 18000 },
              { day: 'Sáb', cash: 30000, credit: 20000 },
              { day: 'Dom', cash: 28000, credit: 19000 },
            ]}
            xKey="day"
            series={[
              { key: 'cash', color: 'var(--color-primary)' },
              { key: 'credit', color: 'var(--color-success)' },
            ]}
          />
        </MicroCard>
        <MicroCard title="Top 5 prod (30d)" $chart>
          <MicroBarChart
            data={[
              { name: 'Remera negra M', units: 45, color: 'var(--color-primary)' },
              { name: 'Jean azul 32', units: 38, color: 'var(--color-success)' },
              { name: 'Zapatilla blanca 40', units: 32, color: 'var(--color-warning)' },
              { name: 'Buzo gris L', units: 28, color: 'var(--color-info)' },
              { name: 'Short negro M', units: 22, color: 'var(--color-danger)' },
            ]}
            xKey="name"
            yKey="units"
            layout="vertical"
          />
        </MicroCard>
      </div>

      {/* Lists Row - 2 compact lists */}
      <div data-testid="lists-row" className="grid grid-cols-1 lg:grid-cols-2 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        <MicroCard title="Ventas recientes"><MicroRecentSales sales={stats.recentSales ?? []} config={config} /></MicroCard>
        <MicroCard title="Atención"><MicroUrgentItems stats={stats} /></MicroCard>
      </div>

      {/* Quick Actions - 3 cols */}
      <MicroCard title="Acciones"><MicroQuickActions actions={stats.quickActions ?? {}} /></MicroCard>
    </section>
  );
}

/** Micro KPI Card - ultra compact */
function MicroKPI({ title, value, subtitle, icon, trend }) {
  const trendColors = { up: 'var(--color-success)', down: 'var(--color-danger)', neutral: 'var(--color-text-secondary)' };
  return (
    <div data-testid="kpi-card" className="card" style={{ minHeight: 0 }}>
      <div className="card-body" style={{ padding: 'var(--dash-card-padding)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 'var(--dash-text-base)', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.1 }}>{title}</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.15 }}>{value}</p>
            <p style={{ margin: '1px 0 0', fontSize: '8px', color: 'var(--color-text-secondary)', lineHeight: 1.1 }}>{subtitle}</p>
          </div>
          <span style={{ fontSize: '12px', opacity: 0.7, flexShrink: 0 }}>{icon}</span>
        </div>
        <div style={{ marginTop: '2px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            padding: '0 4px', borderRadius: '999px',
            fontSize: '7px', fontWeight: 600,
            background: `${trendColors[trend]}20`,
            color: trendColors[trend],
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trend === 'up' ? 'Bien' : trend === 'down' ? 'Atención' : 'OK'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Micro Card wrapper */
function MicroCard({ title, children, $chart = false }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div
        className="card-header"
        style={{
          padding: 'var(--dash-space-1) var(--dash-space-2)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--dash-text-base)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {title}
        </h3>
      </div>
      <div
        className="card-body"
        style={{
          padding: 'var(--dash-space-1) var(--dash-space-2)',
          minHeight: $chart ? undefined : 0,
          overflow: $chart ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Micro Recent Sales - 4 rows max */
function MicroRecentSales({ sales, config }) {
  if (!sales.length) return <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '8px' }}>Sin ventas recientes</div>;

  return (
    <div style={{ fontSize: '8px', lineHeight: 1.3 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
        <thead>
          <tr style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '7px' }}>
            <th style={{ padding: '2px 4px', textAlign: 'left' }}>Venta</th>
            <th style={{ padding: '2px 4px', textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: '2px 4px', textAlign: 'left' }}>Fecha</th>
            <th style={{ padding: '2px 4px', textAlign: 'left' }}>Tipo</th>
            <th style={{ padding: '2px 4px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.slice(0, 4).map((sale) => (
            <tr key={sale.id} style={{ borderTop: '1px solid var(--color-border)' }}>
              <td style={{ padding: '2px 4px', fontFamily: 'monospace', fontSize: '7px', color: 'var(--color-text-secondary)' }}>{sale.id.slice(0, 6)}…</td>
              <td style={{ padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sale.customer_name}</td>
              <td style={{ padding: '2px 4px', whiteSpace: 'nowrap', fontSize: '7px', color: 'var(--color-text-secondary)' }}>{formatDate(sale.created_at, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
              <td style={{ padding: '2px 4px' }}>
                <span style={{ fontSize: '7px', padding: '0 3px', borderRadius: '999px', background: sale.type === 'cash' ? 'var(--color-primary-light)' : 'var(--color-success-light)', color: sale.type === 'cash' ? 'var(--color-primary)' : 'var(--color-success)' }}>{sale.type === 'cash' ? 'C' : 'Cr'}</span>
              </td>
              <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 600, fontSize: '8px' }}>{formatCurrency(sale.total, config)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Micro Urgent Items - compact list */
function MicroUrgentItems({ stats }) {
  const items = [];

  if ((stats.collections?.overdueToday ?? 0) > 0) items.push({ icon: '🔴', label: `${stats.collections.overdueToday} vencidos hoy`, path: '/cobros' });
  if ((stats.collections?.dueNext3Days ?? 0) > 0) items.push({ icon: '🟡', label: `${stats.collections.dueNext3Days} vencen 3d`, path: '/cobros' });
  if ((stats.collections?.withoutPhone ?? 0) > 0) items.push({ icon: '📵', label: `${stats.collections.withoutPhone} sin tel`, path: '/clientes' });
  if ((stats.apartados?.pending ?? 0) > 0) items.push({ icon: '📦', label: `${stats.apartados.pending} apartados`, path: '/apartados' });
  if ((stats.suppliers?.overdue ?? 0) > 0) items.push({ icon: '🏪', label: `${stats.suppliers.overdue} prov. vencidos`, path: '/proveedores' });
  if ((stats.inventory?.lowStock ?? 0) > 0) items.push({ icon: '⚠️', label: `${stats.inventory.lowStock} stock bajo`, path: '/inventory' });

  if (!items.length) return <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '8px' }}>✅ Todo al día</div>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {items.slice(0, 6).map((item, i) => (
        <li key={i}>
          <NavLink to={item.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', padding: '3px 6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', textDecoration: 'none', color: 'inherit', fontSize: '8px', lineHeight: 1.2 }}>
            <span><span style={{ marginRight: '3px' }}>{item.icon}</span>{item.label}</span>
            <span style={{ fontSize: '7px', color: 'var(--color-text-secondary)' }}>→</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Micro Quick Actions - 3 cols x 2 rows */
function MicroQuickActions({ actions }) {
  const actionItems = [
    { path: '/venta', label: 'Nueva venta', icon: '💰', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/credit-sales', label: 'Venta crédito', icon: '📋', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/apartados', label: 'Nuevo apartado', icon: '📦', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/payments', label: 'Registrar cobro', icon: '💵', disabled: !actions.hasOpenDebts },
    { path: '/proveedores', label: 'Deuda prov.', icon: '🏪', disabled: !actions.hasSupplierDebts },
    { path: '/clientes', label: 'Nuevo cliente', icon: '👤', disabled: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
      {actionItems.map((action) => (
        <NavLink
          key={action.path}
          to={action.path}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '4px 2px', gap: '1px',
            border: '1px solid var(--color-border)', borderRadius: '3px',
            background: action.disabled ? 'var(--color-surface-hover)' : 'var(--color-surface)',
            opacity: action.disabled ? 0.5 : 1, pointerEvents: action.disabled ? 'none' : 'auto',
            textDecoration: 'none', color: 'inherit',
            transition: 'border-color 0.1s, background 0.1s',
            minHeight: '56px',
          }}
          onMouseEnter={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <span style={{ fontSize: '11px' }}>{action.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '7px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{action.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

/** Skeleton loading state using new Skeleton primitive */
function DashboardSkeleton() {
  return (
    <section style={{ padding: 'var(--dash-space-2) 0', maxHeight: 'calc(100vh - var(--space-8))', overflow: 'hidden' }}>
      <header className="flex items-center justify-between gap-1 mb-2">
        <Skeleton variant="text" width="80px" height="16px" />
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        {[1, 2, 3, 4].map(i => <MicroSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        <MicroSkeletonChart />
        <MicroSkeletonChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 mb-1" style={{ gap: 'var(--dash-gap)' }}>
        <MicroSkeletonList />
        <MicroSkeletonList />
      </div>
      <MicroSkeletonCard />
    </section>
  );
}

function MicroSkeleton() {
  return (
    <div className="card">
      <div style={{ padding: 'var(--dash-card-padding)' }}>
        <Skeleton variant="text" width="50%" height="8px" style={{ marginBottom: 'var(--dash-space-1)' }} />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
    </div>
  );
}

function MicroSkeletonChart() {
  return (
    <div className="card">
      <div style={{ padding: 'var(--dash-space-1) var(--dash-space-2)' }}>
        <Skeleton variant="rectangular" height="var(--dash-chart-height)" width="100%" />
      </div>
    </div>
  );
}

function MicroSkeletonList() {
  return (
    <div className="card">
      <div style={{ padding: 'var(--dash-space-1) var(--dash-space-2)' }}>
        <Skeleton variant="rectangular" height="120px" width="100%" />
      </div>
    </div>
  );
}

function MicroSkeletonCard() {
  return (
    <div className="card">
      <div style={{ padding: 'var(--dash-space-1) var(--dash-space-2)' }}>
        <Skeleton variant="rectangular" height="70px" width="100%" />
      </div>
    </div>
  );
}

function DashboardError({ onRetry }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div style={{ padding: '12px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 4px', background: 'var(--color-danger-light)' }} />
        <h3 style={{ margin: '0 0 2px', color: 'var(--color-danger)', fontSize: '9px' }}>Error</h3>
        <p style={{ fontSize: '8px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>No se cargaron stats</p>
        <button onClick={onRetry} style={{ padding: '2px 8px', fontSize: '8px', minHeight: '24px' }} className="btn btn-primary">Reintentar</button>
      </div>
    </div>
  );
}