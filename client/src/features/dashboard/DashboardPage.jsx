// Dashboard page — ultra-compact single-screen overview.
// Everything fits in one viewport without scroll.
// Nexo design system: ultra-tight grid, minimal cards, micro charts via recharts.

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
    <section style={{ padding: 'var(--space-2) 0', maxHeight: 'calc(100vh - var(--space-8))', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between gap-1 mb-2 flex-wrap" style={{ alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>Dashboard</h1>
          <p className="form-hint" style={{ marginTop: '0', fontSize: '10px', lineHeight: 1 }}>
            Actualizado {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button type="button" onClick={() => refetch()} className="btn btn-secondary" disabled={isPending} style={{ padding: '2px 8px', fontSize: '9px', minHeight: '24px' }}>
          ⟳
        </button>
      </header>

      {/* KPI Cards Row - 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-1">
        <MicroKPI title="Ventas hoy" value={formatCurrency(stats.sales?.today ?? 0, config)} subtitle={`Ef ${formatCurrency(stats.sales?.cashToday ?? 0, config)} · Cr ${formatCurrency(stats.sales?.creditToday ?? 0, config)}`} icon="💰" trend={stats.sales?.today > 0 ? 'up' : 'neutral'} />
        <MicroKPI title="Stock bajo" value={stats.inventory?.lowStock ?? 0} subtitle={`${stats.inventory?.outOfStock ?? 0} sin · Tot ${formatCurrency(stats.inventory?.totalValue ?? 0, config)}`} icon="📦" trend={stats.inventory?.lowStock > 0 ? 'down' : 'up'} />
        <MicroKPI title="Cobrar urg" value={stats.collections?.overdueToday ?? 0} subtitle={`+3d ${stats.collections?.dueNext3Days ?? 0} · S/tel ${stats.collections?.withoutPhone ?? 0}`} icon="📞" trend={stats.collections?.overdueToday > 0 ? 'down' : 'up'} />
        <MicroKPI title="Proveedores" value={stats.suppliers?.overdue ?? 0} subtitle={`+7d ${stats.suppliers?.dueNext7Days ?? 0} · Ab ${stats.suppliers?.openDebts ?? 0}`} icon="🏪" trend={stats.suppliers?.overdue > 0 ? 'down' : 'up'} />
      </div>

      {/* Charts Row - 2 mini charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
        <MicroCard title="Ventas 7d"><MicroSalesChart /></MicroCard>
        <MicroCard title="Top 5 prod (30d)"><MicroTopProductsChart /></MicroCard>
      </div>

      {/* Lists Row - 2 compact lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
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
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-body" style={{ padding: '4px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.1 }}>{title}</p>
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
            background: `${({ up: 'var(--color-success)', down: 'var(--color-danger)', neutral: 'var(--color-text-secondary)' }[trend])}20`,
            color: { up: 'var(--color-success)', down: 'var(--color-danger)', neutral: 'var(--color-text-secondary)' }[trend],
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trend === 'up' ? 'Bien' : trend === 'down' ? 'Atención' : 'OK'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Micro Card wrapper */
function MicroCard({ title, children }) {
  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-header" style={{ padding: '3px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: '9px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h3>
      </div>
      <div className="card-body" style={{ padding: '4px 8px', minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

/** Micro Sales Chart - 90px height */
function MicroSalesChart() {
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
    <ResponsiveContainer width="100%" height="90px">
      <AreaChart data={data} margin={{ top: 2, right: 5, left: -5, bottom: -8 }}>
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
        <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" vertical={false} horizontal={true} />
        <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={8} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-text-secondary)" fontSize={8} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', fontSize: '8px' }}
          labelStyle={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '8px' }}
          itemStyle={{ fontSize: '8px' }}
          formatter={(value) => [formatCurrency(value, { currencySymbol: '$', currencyLocale: 'es-AR' })]}
        />
        <Area type="monotone" dataKey="cash" stackId="1" fill="url(#colorCash)" stroke="var(--color-primary)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="credit" stackId="1" fill="url(#colorCredit)" stroke="var(--color-success)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Micro Top Products Chart - 90px height */
function MicroTopProductsChart() {
  const data = [
    { name: 'Remera negra M', units: 45, color: 'var(--color-primary)' },
    { name: 'Jean azul 32', units: 38, color: 'var(--color-success)' },
    { name: 'Zapatilla blanca 40', units: 32, color: 'var(--color-warning)' },
    { name: 'Buzo gris L', units: 28, color: 'var(--color-info)' },
    { name: 'Short negro M', units: 22, color: 'var(--color-danger)' },
  ];

  return (
    <ResponsiveContainer width="100%" height="90px">
      <BarChart data={data} layout="vertical" margin={{ top: 2, right: 2, left: -5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" stroke="var(--color-text-secondary)" fontSize={7} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={80} stroke="var(--color-text-secondary)" fontSize={8} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', fontSize: '8px' }} formatter={(value) => [value, 'und']} />
        <Bar dataKey="units" radius={[0, 2, 2, 0]} barSize={16}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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

/** Skeleton */
function DashboardSkeleton() {
  return (
    <section style={{ padding: 'var(--space-2) 0', maxHeight: 'calc(100vh - var(--space-8))', overflow: 'hidden' }}>
      <header className="flex items-center justify-between gap-1 mb-2"><div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '3px' }} /></header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-1">{[1,2,3,4].map(i => <MicroSkeleton key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1"><MicroSkeletonChart /><MicroSkeletonChart /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1"><MicroSkeletonList /><MicroSkeletonList /></div>
      <MicroSkeletonCard />
    </section>
  );
}

function MicroSkeleton() {
  return <div className="card"><div style={{ padding: '4px 8px' }}><div className="skeleton" style={{ width: '50%', height: '8px', borderRadius: '2px', marginBottom: '2px' }} /><div className="skeleton" style={{ width: '40%', height: '12px', borderRadius: '2px' }} /></div></div>;
}
function MicroSkeletonChart() { return <div className="card"><div className="skeleton" style={{ height: '90px', borderRadius: '3px', padding: '4px 8px' }} /></div>; }
function MicroSkeletonList() { return <div className="card"><div className="skeleton" style={{ height: '120px', borderRadius: '3px', padding: '4px 8px' }} /></div>; }
function MicroSkeletonCard() { return <div className="card"><div className="skeleton" style={{ height: '70px', borderRadius: '3px', padding: '4px 8px' }} /></div>; }

function DashboardError({ onRetry }) {
  return <div className="card" style={{ minHeight: 0 }}><div style={{ padding: '12px', textAlign: 'center' }}><div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 4px', background: 'var(--color-danger-light)' }} /><h3 style={{ margin: '0 0 2px', color: 'var(--color-danger)', fontSize: '9px' }}>Error</h3><p style={{ fontSize: '8px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>No se cargaron stats</p><button onClick={onRetry} style={{ padding: '2px 8px', fontSize: '8px', minHeight: '24px' }} className="btn btn-primary">Reintentar</button></div></div>;
}