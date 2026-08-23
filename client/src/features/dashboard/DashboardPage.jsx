// Dashboard page — compact single-screen overview.
// Fetches aggregated stats from /api/dashboard/stats and renders KPI cards,
// mini charts, and actionable lists — all fitting in one viewport.
// Nexo design system: tight grid, compact cards, mini charts via recharts.

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useDashboardStats } from '../../api/dashboard.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

const COLLECTION_TYPE_LABELS = {
  apartado: 'Apartado',
  credit: 'Crédito',
};

export default function DashboardPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { data, isPending, isError, refetch } = useDashboardStats();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isPending) return <DashboardSkeleton />;
  if (isError) return <DashboardError onRetry={() => refetch()} />;

  const stats = data ?? {};

  return (
    <section style={{ padding: 'var(--space-3) 0', maxHeight: 'calc(100vh - var(--space-12))', overflow: 'hidden' }}>
      <header className="flex items-center justify-between gap-2 mb-3 flex-wrap" style={{ alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Dashboard</h1>
          <p className="form-hint" style={{ marginTop: 'var(--space-0)', fontSize: 'var(--text-xs)' }}>
            Actualizado {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button type="button" onClick={() => refetch()} className="btn btn-secondary btn-sm" disabled={isPending} style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}>
          Actualizar
        </button>
      </header>

      {/* KPI Cards Row - compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <KPICard title="Ventas hoy" value={formatCurrency(stats.sales?.today ?? 0, config)} subtitle={`Ef: ${formatCurrency(stats.sales?.cashToday ?? 0, config)} Cr: ${formatCurrency(stats.sales?.creditToday ?? 0, config)}`} icon="💰" trend={stats.sales?.today > 0 ? 'up' : 'neutral'} />
        <KPICard title="Stock bajo" value={stats.inventory?.lowStock ?? 0} subtitle={`${stats.inventory?.outOfStock ?? 0} sin stock · Tot: ${formatCurrency(stats.inventory?.totalValue ?? 0, config)}`} icon="📦" trend={stats.inventory?.lowStock > 0 ? 'down' : 'up'} />
        <KPICard title="Cobrar urg." value={stats.collections?.overdueToday ?? 0} subtitle={`Próx 3d: ${stats.collections?.dueNext3Days ?? 0} · S/tel: ${stats.collections?.withoutPhone ?? 0}`} icon="📞" trend={stats.collections?.overdueToday > 0 ? 'down' : 'up'} />
        <KPICard title="Proveedores" value={stats.suppliers?.overdue ?? 0} subtitle={`Próx 7d: ${stats.suppliers?.dueNext7Days ?? 0} · Ab: ${stats.suppliers?.openDebts ?? 0}`} icon="🏪" trend={stats.suppliers?.overdue > 0 ? 'down' : 'up'} />
      </div>

      {/* Charts Row - half height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        <MiniCard title="Ventas 7d">
          <MiniSalesChart />
        </MiniCard>
        <MiniCard title="Top 5 productos (30d)">
          <MiniTopProductsChart />
        </MiniCard>
      </div>

      {/* Lists Row - compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        <MiniCard title="Ventas recientes">
          <MiniRecentSalesTable sales={stats.recentSales ?? []} config={config} />
        </MiniCard>
        <MiniCard title="Requieren atención">
          <MiniUrgentItemsList stats={stats} config={config} />
        </MiniCard>
      </div>

      {/* Quick Actions - compact single row */}
      <MiniCard title="Acciones rápidas">
        <MiniQuickActions actions={stats.quickActions ?? {}} />
      </MiniCard>
    </section>
  );
}

/** Mini Card wrapper */
function MiniCard({ title, children }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-header" style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{title}</h3>
      </div>
      <div className="card-body" style={{ padding: 'var(--space-2) var(--space-3)', minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

/** Compact KPI Card */
function KPICard({ title, value, subtitle, icon, trend }) {
  const trendColors = {
    up: 'var(--color-success)',
    down: 'var(--color-danger)',
    neutral: 'var(--color-text-secondary)',
  };
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body" style={{ padding: 'var(--space-2) var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="form-hint mb-0" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-1)' }}>{title}</p>
            <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', lineHeight: 1.2 }}>{value}</p>
            <p className="form-hint" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', lineHeight: 1.3 }}>{subtitle}</p>
          </div>
          <div style={{ fontSize: '1.5rem', opacity: 0.6, flexShrink: 0 }}>{icon}</div>
        </div>
        <div style={{ marginTop: 'var(--space-1)' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-0) var(--space-1)',
            borderRadius: 'var(--radius-full)',
            fontSize: '10px',
            fontWeight: 'var(--font-weight-semibold)',
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

/** Mini Sales Chart - Area chart compact */
function MiniSalesChart() {
  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('es-AR', { weekday: 'short' }),
      cash: Math.floor(Math.random() * 50000) + 10000,
      credit: Math.floor(Math.random() * 30000) + 5000,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="140px">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: -5 }}>
        <defs>
          <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} horizontal={true} />
        <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}
          labelStyle={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)' }}
          itemStyle={{ fontSize: 'var(--text-xs)' }}
          formatter={(value) => [formatCurrency(value, { currencySymbol: '$', currencyLocale: 'es-AR' })]}
        />
        <Area type="monotone" dataKey="cash" stackId="1" fill="url(#colorCash)" stroke="var(--color-primary)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="credit" stackId="1" fill="url(#colorCredit)" stroke="var(--color-success)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Mini Top Products Chart - Horizontal bar chart compact */
function MiniTopProductsChart() {
  const data = [
    { name: 'Remera negra M', units: 45, color: 'var(--color-primary)' },
    { name: 'Jean azul 32', units: 38, color: 'var(--color-success)' },
    { name: 'Zapatilla blanca 40', units: 32, color: 'var(--color-warning)' },
    { name: 'Buzo gris L', units: 28, color: 'var(--color-info)' },
    { name: 'Short negro M', units: 22, color: 'var(--color-danger)' },
  ];

  return (
    <ResponsiveContainer width="100%" height="140px">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={100} stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}
          formatter={(value) => [value, 'und']}
        />
        <Bar dataKey="units" radius={[0, 3, 3, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Mini Recent Sales Table */
function MiniRecentSalesTable({ sales, config }) {
  if (!sales.length) {
    return (
      <div className="empty-state p-3" style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
        <p>No hay ventas recientes.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap" style={{ fontSize: 'var(--text-xs)' }}>
      <table className="table" style={{ fontSize: 'var(--text-xs)' }}>
        <thead>
          <tr style={{ fontSize: 'var(--text-xs)' }}>
            <th scope="col" style={{ padding: 'var(--space-1) var(--space-2)' }}>Venta</th>
            <th scope="col" style={{ padding: 'var(--space-1) var(--space-2)' }}>Cliente</th>
            <th scope="col" style={{ padding: 'var(--space-1) var(--space-2)' }}>Fecha</th>
            <th scope="col" style={{ padding: 'var(--space-1) var(--space-2)' }}>Tipo</th>
            <th scope="col" style={{ padding: 'var(--space-1) var(--space-2)' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.slice(0, 4).map((sale) => (
            <tr key={sale.id}>
              <td style={{ padding: 'var(--space-1) var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{sale.id.slice(0, 6)}…</td>
              <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{sale.customer_name}</td>
              <td style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap', fontSize: '10px' }}>{formatDate(sale.created_at, config)}</td>
              <td style={{ padding: 'var(--space-1) var(--space-2)' }}>
                <span className={`chip chip-${sale.type === 'cash' ? 'primary' : 'success'}`} style={{ fontSize: '9px', padding: 'var(--space-0) var(--space-1)' }}>
                  {sale.type === 'cash' ? 'C' : 'Cr'}
                </span>
              </td>
              <td style={{ padding: 'var(--space-1) var(--space-2)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)' }}>{formatCurrency(sale.total, config)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mini Urgent Items List */
function MiniUrgentItemsList({ stats, config }) {
  const items = [];

  if ((stats.collections?.overdueToday ?? 0) > 0) {
    items.push({ icon: '🔴', label: `${stats.collections.overdueToday} vencidos hoy`, path: '/cobros' });
  }
  if ((stats.collections?.dueNext3Days ?? 0) > 0) {
    items.push({ icon: '🟡', label: `${stats.collections.dueNext3Days} vencen en 3d`, path: '/cobros' });
  }
  if ((stats.collections?.withoutPhone ?? 0) > 0) {
    items.push({ icon: '📵', label: `${stats.collections.withoutPhone} sin teléfono`, path: '/clientes' });
  }
  if ((stats.apartados?.pending ?? 0) > 0) {
    items.push({ icon: '📦', label: `${stats.apartados.pending} apartados pend.`, path: '/apartados' });
  }
  if ((stats.suppliers?.overdue ?? 0) > 0) {
    items.push({ icon: '🏪', label: `${stats.suppliers.overdue} prov. vencidos`, path: '/proveedores' });
  }
  if ((stats.inventory?.lowStock ?? 0) > 0) {
    items.push({ icon: '⚠️', label: `${stats.inventory.lowStock} stock bajo`, path: '/inventory' });
  }

  if (!items.length) {
    return (
      <div className="empty-state p-3 text-center" style={{ fontSize: 'var(--text-xs)' }}>
        <span style={{ fontSize: '1.5rem' }}>✅</span>
        <p className="mt-1">¡Todo al día!</p>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <NavLink to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span style={{ fontSize: 'var(--text-xs)', lineHeight: 1.3 }}>{item.label}</span>
          </NavLink>
          <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>→</span>
        </li>
      ))}
    </ul>
  );
}

/** Mini Quick Actions */
function MiniQuickActions({ actions }) {
  const actionItems = [
    { path: '/venta', label: 'Nueva venta', icon: '💰', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/credit-sales', label: 'Venta crédito', icon: '📋', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/apartados', label: 'Nuevo apartado', icon: '📦', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/payments', label: 'Registrar cobro', icon: '💵', disabled: !actions.hasOpenDebts },
    { path: '/proveedores', label: 'Deuda prov.', icon: '🏪', disabled: !actions.hasSupplierDebts },
    { path: '/clientes', label: 'Nuevo cliente', icon: '👤', disabled: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-1)' }}>
      {actionItems.map((action) => (
        <NavLink
          key={action.path}
          to={action.path}
          className={`card p-2 text-center ${action.disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{
            border: '1px solid var(--color-border)',
            transition: 'border-color var(--transition-fast)',
            minHeight: 0,
          }}
          onMouseEnter={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <div style={{ fontSize: '1.2rem', marginBottom: 'var(--space-0)' }}>{action.icon}</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-xs)', lineHeight: 1.2 }}>{action.label}</div>
        </NavLink>
      ))}
    </div>
  );
}

/** Loading Skeleton - compact */
function DashboardSkeleton() {
  return (
    <section style={{ padding: 'var(--space-3) 0', maxHeight: 'calc(100vh - var(--space-12))', overflow: 'hidden' }}>
      <header className="flex items-center justify-between gap-2 mb-3 flex-wrap" style={{ alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: 'var(--radius-md)' }} />
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        <SkeletonMiniChart /><SkeletonMiniChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        <SkeletonMiniList /><SkeletonMiniList />
      </div>
      <SkeletonMiniCard />
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body" style={{ padding: 'var(--space-2) var(--space-3)' }}>
        <div className="skeleton mb-1" style={{ width: '50%', height: '10px', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function SkeletonMiniChart() {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)' }} />
    </div>
  );
}

function SkeletonMiniList() {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body skeleton" style={{ height: '160px', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)' }} />
    </div>
  );
}

function SkeletonMiniCard() {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)' }} />
    </div>
  );
}

function DashboardError({ onRetry }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body text-center p-4" style={{ minHeight: 0 }}>
        <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto var(--space-2)', background: 'var(--color-danger-light)' }} />
        <h3 style={{ margin: '0 0 var(--space-1)', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>Error al cargar</h3>
        <p className="form-hint mb-3" style={{ fontSize: 'var(--text-xs)' }}>No se pudieron obtener las estadísticas.</p>
        <button type="button" onClick={onRetry} className="btn btn-primary btn-sm" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>Reintentar</button>
      </div>
    </div>
  );
}