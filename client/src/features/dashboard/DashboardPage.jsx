// Dashboard page — redesigned per mockup: KPI scroll strip, chart card, movements list
import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useDashboardStats } from '../../api/dashboard.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { MicroBarChart } from './MicroCharts';
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

  // Derived data for mockup KPIs
  const ventasDelDia = stats.sales?.today ?? 0;
  const cuentasPorCobrar = (stats.collections?.overdueToday ?? 0) + (stats.collections?.dueNext3Days ?? 0) + (stats.customers?.totalBalance ?? 0);
  const valorInventario = stats.inventory?.totalValue ?? 0;

  // Mock 7-day income data for chart (API doesn't provide daily breakdown yet)
  const income7Days = [
    { day: 'Lun', income: 12000 },
    { day: 'Mar', income: 18000 },
    { day: 'Mié', income: 15000 },
    { day: 'Jue', income: 22000 },
    { day: 'Vie', income: 25000 },
    { day: 'Sáb', income: 30000 },
    { day: 'Dom', income: 28000 },
  ];

  // Mock recent movements for "Últimos movimientos" list
  const recentMovements = [
    { type: 'rendimiento', title: 'Rendimiento', amount: 1275.00, cantidad: 'USD', precio: 0.00, iconColor: 'green' },
    { type: 'cobranzas', title: 'Cobranzas', amount: 1685.00, cantidad: 'VES', precio: 0.00, iconColor: 'blue' },
    { type: 'venta', title: 'Venta: Producto A', amount: 950.00, cantidad: 30.00, precio: 1.75, currency: 'VES', iconColor: 'green' },
    { type: 'abono', title: 'Abono: Cliente B', amount: 300.00, cantidad: 30.00, precio: 'AS 30.00', iconColor: 'blue' },
    { type: 'gasto', title: 'Gasto: Oficina', amount: 150.00, cantidad: 50.00, precio: 12.00, currency: 'VES', iconColor: 'red' },
    { type: 'venta', title: 'Venta: Producto A', amount: 200.00, cantidad: 30.00, iconColor: 'green' },
  ];

  return (
    <section
      data-testid="dashboard-root"
      className="dashboard-root"
      style={{
        padding: 'var(--dash-space-2) 0',
        maxHeight: 'calc(100vh - var(--space-8))',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--dash-gap)',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          style={{
            position: 'relative',
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
            zIndex: 10,
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

      {/* Page Header */}
      <header className="flex items-center justify-between gap-2 mb-1" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--dash-text-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
            }}
          >
            Dashboard
          </h1>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={isPending || isRefreshing}
          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-sm)', minHeight: 'var(--touch-target-sm)' }}
        >
          ⟳
        </button>
      </header>

      {/* KPI Scroll Strip (mobile) / Row (desktop) */}
      <div
        data-testid="kpi-strip"
        className="kpi-strip"
        style={{
          display: 'flex',
          gap: 'var(--dash-gap)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: 'var(--space-2)',
          paddingRight: 'var(--space-4)',  /* peek de la 3ra tarjeta */
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          zIndex: 5,
          minHeight: '100px',
        }}
      >
        <KPICard
          title="Ventas del día"
          value={formatCurrency(ventasDelDia, config)}
          icon="💰"
        />
        <KPICard
          title="Cuentas por cobrar"
          value={formatCurrency(cuentasPorCobrar, config)}
          icon="📞"
        />
        <KPICard
          title="Valor del inventario"
          value={formatCurrency(valorInventario, config)}
          icon="📦"
        />
      </div>

      {/* Main Content Grid: Chart (2/3) + Movements (1/3) on desktop, stacked on mobile */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--dash-gap)' }}>
        {/* Ingresos (7 días) Chart Card */}
        <section className="card" style={{ minHeight: 0 }}>
          <header className="card-header" style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
              Ingresos (7 días)
            </h2>
          </header>
          <div className="card-body" style={{ padding: 'var(--space-4)', minHeight: '300px' }}>
            <MicroBarChart
              data={income7Days}
              xKey="day"
              yKey="income"
              barColors={[
                'var(--color-success)',      // Lun - verde esmeralda
                'var(--color-info)',         // Mar - azul secundario
                'var(--color-primary)',      // Mié - azul marino
                'var(--color-success)',      // Jue - verde esmeralda
                'var(--color-info)',         // Vie - azul secundario
                'var(--color-primary)',      // Sáb - azul marino
                'var(--color-success)',      // Dom - verde esmeralda
              ]}
              height={280}
              showGrid
              showAxis
              yAxisFormatter={(v) => formatCurrency(v, config)}
            />
          </div>
        </section>

        {/* Últimos movimientos List */}
        <section className="card" style={{ minHeight: 0 }}>
          <header className="card-header" style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
              Últimos movimientos
            </h2>
          </header>
          <div className="card-body" style={{ padding: 0 }}>
            <ul className="movements-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentMovements.map((mov, i) => (
                <li key={i} className="movement-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: i < recentMovements.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  {/* Icon circle with pastel background */}
                  <span className="movement-icon" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getIconBg(mov.iconColor),
                    color: getIconColor(mov.iconColor),
                    flexShrink: 0,
                    fontSize: '18px',
                  }}>
                    {getIconForType(mov.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
                      {mov.title}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                      <span>Cantidad: <strong>{formatCurrency(mov.cantidad, config)}</strong></span>
                      {mov.precio !== undefined && mov.precio !== 0 && (
                        <span>Precio unidad: <strong>{mov.currency ? `${mov.currency} ` : ''}${formatCurrency(mov.precio, config)}</strong></span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)' }}>
                      {formatCurrency(mov.amount, config)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Pull-to-refresh touch handlers */}
      <div
        style={{ height: 0 }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </section>
  );
}

/** KPI Card for scroll strip */
function KPICard({ title, value, icon }) {
  return (
    <div
      data-testid="kpi-card"
      className="kpi-card"
      style={{
        flex: '0 0 auto',
        width: '260px',
        scrollSnapAlign: 'start',
        minWidth: '240px',
        maxWidth: '280px',
      }}
    >
      <div className="card" style={{ minHeight: 0 }}>
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>
                {title}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                {value}
              </p>
            </div>
            <span style={{ fontSize: '20px', opacity: 0.8, flexShrink: 0 }}>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getIconBg(color) {
  switch (color) {
    case 'green': return 'var(--color-success-light)';
    case 'blue': return 'var(--color-info-light)';
    case 'red': return 'var(--color-danger-light)';
    default: return 'var(--color-primary-light)';
  }
}

function getIconColor(color) {
  switch (color) {
    case 'green': return 'var(--color-success)';
    case 'blue': return 'var(--color-info)';
    case 'red': return 'var(--color-danger)';
    default: return 'var(--color-primary)';
  }
}

function getIconForType(type) {
  switch (type) {
    case 'rendimiento': return '⟳';
    case 'cobranzas': return '$';
    case 'venta': return '🛒';
    case 'abono': return '↩';
    case 'gasto': return '📄';
    default: return '•';
  }
}

/** Skeleton loading state */
function DashboardSkeleton() {
  return (
    <section style={{ padding: 'var(--dash-space-2) 0', display: 'flex', flexDirection: 'column', gap: 'var(--dash-gap)' }}>
      <header className="flex items-center justify-between gap-2 mb-1">
        <Skeleton variant="text" width="100px" height="24px" />
        <Skeleton variant="rectangular" width="60px" height="36px" />
      </header>
      <div className="kpi-strip" style={{ display: 'flex', gap: 'var(--dash-gap)', overflowX: 'auto' }}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" width="260px" height="100px" style={{ flexShrink: 0 }} />)}
      </div>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--dash-gap)' }}>
        <Skeleton variant="rectangular" width="100%" height="400px" />
        <Skeleton variant="rectangular" width="100%" height="400px" />
      </div>
    </section>
  );
}

function DashboardError({ onRetry }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto var(--space-2)', background: 'var(--color-danger-light)' }} />
        <h3 style={{ margin: '0 0 var(--space-1)', color: 'var(--color-danger)', fontSize: 'var(--text-base)' }}>Error</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-3)' }}>No se cargaron datos del dashboard</p>
        <button onClick={onRetry} className="btn btn-primary">Reintentar</button>
      </div>
    </div>
  );
}