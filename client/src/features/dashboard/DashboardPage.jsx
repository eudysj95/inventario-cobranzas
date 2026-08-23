// Dashboard page — main landing page showing business overview.
// Fetches aggregated stats from /api/dashboard/stats and renders KPI cards,
// charts, and actionable lists.
// Nexo design system: grid, cards, tables, charts via utilities + recharts.

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useDashboardStats } from '../../api/dashboard.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// Chart colors matching design tokens
const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-danger)',
];

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
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-6 flex-wrap" style={{ alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Dashboard</h1>
          <p className="form-hint" style={{ marginTop: 'var(--space-1)' }}>
            Resumen del negocio · Actualizado {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button type="button" onClick={() => refetch()} className="btn btn-secondary btn-sm" disabled={isPending}>
          Actualizar
        </button>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Ventas hoy"
          value={formatCurrency(stats.sales?.today ?? 0, config)}
          subtitle={`Efectivo: ${formatCurrency(stats.sales?.cashToday ?? 0, config)} · Crédito: ${formatCurrency(stats.sales?.creditToday ?? 0, config)}`}
          icon="💰"
          trend={stats.sales?.today > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="Stock bajo"
          value={stats.inventory?.lowStock ?? 0}
          subtitle={`${stats.inventory?.outOfStock ?? 0} sin stock · Valor total: ${formatCurrency(stats.inventory?.totalValue ?? 0, config)}`}
          icon="📦"
          trend={stats.inventory?.lowStock > 0 ? 'down' : 'up'}
        />
        <KPICard
          title="Cobrar urgente"
          value={stats.collections?.overdueToday ?? 0}
          subtitle={`Próx. 3 días: ${stats.collections?.dueNext3Days ?? 0} · Sin teléfono: ${stats.collections?.withoutPhone ?? 0}`}
          icon="📞"
          trend={stats.collections?.overdueToday > 0 ? 'down' : 'up'}
        />
        <KPICard
          title="Proveedores"
          value={stats.suppliers?.overdue ?? 0}
          subtitle={`Próx. 7 días: ${stats.suppliers?.dueNext7Days ?? 0} · Abiertas: ${stats.suppliers?.openDebts ?? 0}`}
          icon="🏪"
          trend={stats.suppliers?.overdue > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Ventas últimos 7 días</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <SalesChart />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Top 5 productos (30 días)</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <TopProductsChart />
          </div>
        </div>
      </div>

      {/* Actionable Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Sales */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Ventas recientes</h3>
            <NavLink to="/venta" className="btn btn-secondary btn-sm">Ver todas</NavLink>
          </div>
          <div className="card-body p-0">
            <RecentSalesTable sales={stats.recentSales ?? []} config={config} />
          </div>
        </div>

        {/* Urgent Items */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Requieren atención</h3>
            <NavLink to="/cobros" className="btn btn-secondary btn-sm">Ver cobranzas</NavLink>
          </div>
          <div className="card-body p-0">
            <UrgentItemsList stats={stats} config={config} />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Acciones rápidas</h3>
        </div>
        <div className="card-body">
          <QuickActions actions={stats.quickActions ?? {}} />
        </div>
      </div>
    </section>
  );
}

/** KPI Card component */
function KPICard({ title, value, subtitle, icon, trend }) {
  const trendColors = {
    up: 'var(--color-success)',
    down: 'var(--color-danger)',
    neutral: 'var(--color-text-secondary)',
  };
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="form-hint mb-1" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>{title}</p>
            <p style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{value}</p>
            <p className="form-hint mt-1" style={{ fontSize: 'var(--text-xs)' }}>{subtitle}</p>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.6, flexShrink: 0 }}>{icon}</div>
        </div>
        <div className="mt-3" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            background: `${trendColors[trend]}20`,
            color: trendColors[trend],
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trend === 'up' ? 'Bien' : trend === 'down' ? 'Atención' : 'Neutral'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Sales Chart - Area chart for last 7 days */
function SalesChart() {
  // Generate last 7 days data (in real app, this would come from API)
  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('es-AR', { weekday: 'short' }),
      date: date.toISOString().split('T')[0],
      cash: Math.floor(Math.random() * 50000) + 10000,
      credit: Math.floor(Math.random() * 30000) + 5000,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
          labelStyle={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-semibold)' }}
          itemStyle={{ fontSize: 'var(--text-sm)' }}
          formatter={(value) => [formatCurrency(value, { currencySymbol: '$', currencyLocale: 'es-AR' })]}
        />
        <Legend />
        <Area type="monotone" dataKey="cash" stackId="1" fill="url(#colorCash)" stroke="var(--color-primary)" strokeWidth={2} name="Efectivo" />
        <Area type="monotone" dataKey="credit" stackId="1" fill="url(#colorCredit)" stroke="var(--color-success)" strokeWidth={2} name="Crédito" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Top Products Chart - Horizontal bar chart */
function TopProductsChart() {
  // In real app, this would use stats.topProducts
  const data = [
    { name: 'Remera negra M', units: 45, color: 'var(--color-primary)' },
    { name: 'Jean azul 32', units: 38, color: 'var(--color-success)' },
    { name: 'Zapatilla blanca 40', units: 32, color: 'var(--color-warning)' },
    { name: 'Buzo gris L', units: 28, color: 'var(--color-info)' },
    { name: 'Short negro M', units: 22, color: 'var(--color-danger)' },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={140} stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
          formatter={(value) => [value, 'unidades']}
        />
        <Bar dataKey="units" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Recent Sales Table */
function RecentSalesTable({ sales, config }) {
  if (!sales.length) {
    return (
      <div className="empty-state p-6">
        <p>No hay ventas recientes.</p>
        <NavLink to="/venta" className="btn btn-primary mt-3">Registrar primera venta</NavLink>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Venta</th>
            <th scope="col">Cliente</th>
            <th scope="col">Fecha</th>
            <th scope="col">Tipo</th>
            <th scope="col">Total</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{sale.id.slice(0, 8)}…</td>
              <td>{sale.customer_name}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(sale.created_at, config)}</td>
              <td>
                <span className={`chip chip-${sale.type === 'cash' ? 'primary' : 'success'}`}>
                  {sale.type === 'cash' ? 'Contado' : 'Crédito'}
                </span>
              </td>
              <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(sale.total, config)}</td>
              <td>
                <NavLink to={sale.type === 'cash' ? `/venta/${sale.id}` : `/credit-sales/${sale.id}`} className="btn btn-secondary btn-sm">
                  Ver
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Urgent Items List */
function UrgentItemsList({ stats, config }) {
  const items = [];

  if ((stats.collections?.overdueToday ?? 0) > 0) {
    items.push({
      icon: '🔴',
      label: `${stats.collections.overdueToday} clientes vencidos hoy`,
      action: <NavLink to="/cobros" className="btn btn-danger btn-sm">Ver cobranzas</NavLink>,
    });
  }
  if ((stats.collections?.dueNext3Days ?? 0) > 0) {
    items.push({
      icon: '🟡',
      label: `${stats.collections.dueNext3Days} vencen en 3 días`,
      action: <NavLink to="/cobros" className="btn btn-warning btn-sm">Ver próximas</NavLink>,
    });
  }
  if ((stats.collections?.withoutPhone ?? 0) > 0) {
    items.push({
      icon: '📵',
      label: `${stats.collections.withoutPhone} sin teléfono`,
      action: <NavLink to="/clientes" className="btn btn-secondary btn-sm">Completar datos</NavLink>,
    });
  }
  if ((stats.apartados?.pending ?? 0) > 0) {
    items.push({
      icon: '📦',
      label: `${stats.apartados.pending} apartados pendientes`,
      action: <NavLink to="/apartados" className="btn btn-secondary btn-sm">Ver apartados</NavLink>,
    });
  }
  if ((stats.suppliers?.overdue ?? 0) > 0) {
    items.push({
      icon: '🏪',
      label: `${stats.suppliers.overdue} deudas proveedor vencidas`,
      action: <NavLink to="/proveedores" className="btn btn-danger btn-sm">Ver proveedores</NavLink>,
    });
  }
  if ((stats.inventory?.lowStock ?? 0) > 0) {
    items.push({
      icon: '⚠️',
      label: `${stats.inventory.lowStock} productos con stock bajo`,
      action: <NavLink to="/inventory" className="btn btn-warning btn-sm">Reponer stock</NavLink>,
    });
  }

  if (!items.length) {
    return (
      <div className="empty-state p-6 text-center">
        <span style={{ fontSize: '3rem' }}>✅</span>
        <p className="mt-2">¡Todo al día! No hay items urgentes.</p>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {items.map((item, i) => (
        <li key={i} className="card p-3" style={{ border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span style={{ fontSize: 'var(--text-sm)' }}>{item.label}</span>
          </div>
          <div style={{ flexShrink: 0 }}>{item.action}</div>
        </li>
      ))}
    </ul>
  );
}

/** Quick Actions Grid */
function QuickActions({ actions }) {
  const actionItems = [
    { path: '/venta', label: 'Nueva venta', icon: '💰', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/credit-sales', label: 'Venta a crédito', icon: '📋', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/apartados', label: 'Nuevo apartado', icon: '📦', disabled: !actions.hasProducts || !actions.hasCustomers },
    { path: '/payments', label: 'Registrar cobro', icon: '💵', disabled: !actions.hasOpenDebts },
    { path: '/proveedores', label: 'Deuda proveedor', icon: '🏪', disabled: !actions.hasSupplierDebts },
    { path: '/clientes', label: 'Nuevo cliente', icon: '👤', disabled: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
      {actionItems.map((action) => (
        <NavLink
          key={action.path}
          to={action.path}
          className={`card p-4 text-center ${action.disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{
            border: '1px solid var(--color-border)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          onMouseEnter={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => !action.disabled && (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{action.icon}</div>
          <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>{action.label}</div>
          {action.disabled && <div className="form-hint mt-1" style={{ fontSize: 'var(--text-xs)' }}>Requiere datos previos</div>}
        </NavLink>
      ))}
    </div>
  );
}

/** Loading Skeleton */
function DashboardSkeleton() {
  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-6 flex-wrap" style={{ alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '180px', height: '28px', borderRadius: 'var(--radius-md)' }} />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SkeletonChart /><SkeletonChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SkeletonTable /><SkeletonList />
      </div>
      <SkeletonCard />
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="skeleton mb-2" style={{ width: '60%', height: '14px', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: '40%', height: '36px', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="card">
      <div className="card-body skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}

function DashboardError({ onRetry }) {
  return (
    <div className="card">
      <div className="card-body text-center p-8">
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto var(--space-4)', background: 'var(--color-danger-light)' }} />
        <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-danger)' }}>Error al cargar dashboard</h3>
        <p className="form-hint mb-4">No se pudieron obtener las estadísticas.</p>
        <button type="button" onClick={onRetry} className="btn btn-primary">Reintentar</button>
      </div>
    </div>
  );
}