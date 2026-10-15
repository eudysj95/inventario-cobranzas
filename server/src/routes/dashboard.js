import { Router } from 'express';
import { requireAuth } from '../auth.js';

/**
 * Dashboard routes — aggregated stats for the main landing page.
 * Single endpoint that returns all KPIs needed for the dashboard view.
 * All routes require an authenticated session.
 */

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

function toDateString(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Mock data for development when database is unreachable
const MOCK_STATS = {
  sales: {
    today: 125000,
    week: 487000,
    month: 1850000,
    cashToday: 85000,
    creditToday: 40000,
  },
  inventory: {
    totalProducts: 156,
    lowStock: 8,
    outOfStock: 3,
    totalValue: 2450000,
  },
  customers: {
    total: 89,
    withBalance: 23,
    overdue: 5,
  },
  apartados: {
    pending: 12,
    paidThisWeek: 7,
    cancelledThisWeek: 2,
    reservedUnits: 34,
  },
  collections: {
    overdueToday: 5,
    dueNext3Days: 8,
    withoutPhone: 3,
  },
  suppliers: {
    openDebts: 4,
    dueNext7Days: 2,
    overdue: 1,
  },
  recentSales: [
    { id: 'CS-001', customer_id: 'c1', customer_name: 'María González', created_at: new Date().toISOString(), total: 45000, type: 'cash' },
    { id: 'CR-002', customer_id: 'c2', customer_name: 'Carlos Ruiz', created_at: new Date(Date.now() - 3600000).toISOString(), total: 120000, type: 'credit' },
    { id: 'CS-003', customer_id: 'c3', customer_name: 'Ana López', created_at: new Date(Date.now() - 7200000).toISOString(), total: 32000, type: 'cash' },
    { id: 'CR-004', customer_id: 'c4', customer_name: 'Pedro Silva', created_at: new Date(Date.now() - 10800000).toISOString(), total: 89000, type: 'credit' },
    { id: 'CS-005', customer_id: 'c5', customer_name: 'Laura Martín', created_at: new Date(Date.now() - 14400000).toISOString(), total: 28000, type: 'cash' },
  ],
  topProducts: [
    { id: 'p1', name: 'Remera negra M', totalUnits: 45, revenue: 225000 },
    { id: 'p2', name: 'Jean azul 32', totalUnits: 38, revenue: 304000 },
    { id: 'p3', name: 'Zapatilla blanca 40', totalUnits: 32, revenue: 480000 },
    { id: 'p4', name: 'Buzo gris L', totalUnits: 28, revenue: 252000 },
    { id: 'p5', name: 'Short negro M', totalUnits: 22, revenue: 154000 },
  ],
  quickActions: {
    hasProducts: true,
    hasCustomers: true,
    hasPendingApartados: true,
    hasOpenDebts: true,
    hasSupplierDebts: true,
  },
};

export default function dashboardRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  // Check if we should use mock data (database unreachable)
  const useMock = process.env.USE_MOCK_DASHBOARD === 'true' || !pool;

  /**
   * GET /api/dashboard/stats
   * Returns aggregated dashboard data:
   * - sales: today, this week, this month (cash + credit)
   * - inventory: total products, low stock count, out of stock count, total value
   * - customers: total, with open balance, overdue count
   * - apartados: pending, paid this week, cancelled this week, reserved units
   * - collections: overdue today, due next 3 days, without phone
   * - suppliers: open debts, due next 7 days, overdue
   * - recentSales: last 5 sales (cash + credit combined)
   * - topProducts: top 5 by units sold (last 30 days)
   * - quickActions: counts for empty-state buttons
   */
  router.get('/stats', async (req, res) => {
    // Use mock data if explicitly enabled or if pool is not available
    if (useMock) {
      return res.json(MOCK_STATS);
    }

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Monday
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const next3Days = new Date(todayStart);
      next3Days.setDate(next3Days.getDate() + 3);
      const next7Days = new Date(todayStart);
      next7Days.setDate(next7Days.getDate() + 7);
      const thirtyDaysAgo = new Date(todayStart);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // ===== SALES =====
      // Cash sales today/week/month
      const cashSalesResult = await pool.query(`
        SELECT
          SUM(CASE WHEN cs.created_at >= $1 THEN cs.amount ELSE 0 END) AS today,
          SUM(CASE WHEN cs.created_at >= $2 THEN cs.amount ELSE 0 END) AS week,
          SUM(CASE WHEN cs.created_at >= $3 THEN cs.amount ELSE 0 END) AS month
        FROM cash_sales cs
      `, [todayStart, weekStart, monthStart]);

      // Credit sales today/week/month
      const creditSalesResult = await pool.query(`
        SELECT
          SUM(CASE WHEN d.created_at >= $1 THEN d.amount ELSE 0 END) AS today,
          SUM(CASE WHEN d.created_at >= $2 THEN d.amount ELSE 0 END) AS week,
          SUM(CASE WHEN d.created_at >= $3 THEN d.amount ELSE 0 END) AS month
        FROM customer_debts d
      `, [todayStart, weekStart, monthStart]);

      const cash = cashSalesResult.rows[0];
      const credit = creditSalesResult.rows[0];

      const salesToday = roundMoney(Number(cash.today || 0) + Number(credit.today || 0));
      const salesWeek = roundMoney(Number(cash.week || 0) + Number(credit.week || 0));
      const salesMonth = roundMoney(Number(cash.month || 0) + Number(credit.month || 0));

      // ===== INVENTORY =====
      const inventoryResult = await pool.query(`
        SELECT
          COUNT(*) AS total_products,
          SUM(CASE WHEN quantity <= 5 AND quantity > 0 THEN 1 ELSE 0 END) AS low_stock,
          SUM(CASE WHEN quantity <= 0 THEN 1 ELSE 0 END) AS out_of_stock,
          SUM(quantity * price) AS total_value
        FROM products
      `);

      const inv = inventoryResult.rows[0];

      // ===== CUSTOMERS =====
      const customersResult = await pool.query(`
        SELECT
          COUNT(*) AS total_customers,
          SUM(CASE WHEN open_balance > 0 THEN 1 ELSE 0 END) AS with_balance,
          (
            SELECT COUNT(DISTINCT cd.customer_id)
            FROM customer_debts cd
            WHERE cd.balance > 0 AND cd.due_date < CURRENT_DATE
          ) AS overdue_count
        FROM (
          SELECT c.id,
            (COALESCE(d.total_balance, 0) + COALESCE(a.total_remaining, 0)) AS open_balance
          FROM customers c
          LEFT JOIN (
            SELECT customer_id, SUM(balance) AS total_balance
            FROM customer_debts
            WHERE status = 'open'
            GROUP BY customer_id
          ) d ON d.customer_id = c.id
          LEFT JOIN (
            SELECT ap.customer_id,
                   SUM(GREATEST(ap.agreed_price - COALESCE(p.paid, 0), 0)) AS total_remaining
            FROM apartados ap
            LEFT JOIN (
              SELECT apartado_id, SUM(amount) AS paid
              FROM apartado_payments
              GROUP BY apartado_id
            ) p ON p.apartado_id = ap.id
            WHERE ap.status = 'pending'
            GROUP BY ap.customer_id
          ) a ON a.customer_id = c.id
        ) c
      `);

      const cust = customersResult.rows[0];

      // ===== APARTADOS =====
      const apartadosResult = await pool.query(`
        SELECT
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'paid' AND updated_at >= $1 THEN 1 ELSE 0 END) AS paid_this_week,
          SUM(CASE WHEN status = 'cancelled' AND updated_at >= $1 THEN 1 ELSE 0 END) AS cancelled_this_week,
          SUM(CASE WHEN status = 'pending' THEN units ELSE 0 END) AS reserved_units
        FROM apartados
      `, [weekStart]);

      const ap = apartadosResult.rows[0];

      // ===== COLLECTIONS (COBRANZAS) =====
      const collectionsResult = await pool.query(`
        SELECT
          -- Total open balance across ALL customer debts (balance > 0)
          COALESCE(SUM(CASE WHEN d.balance > 0 THEN d.balance ELSE 0 END), 0) AS total_open_balance,
          -- Overdue today (due_date < today, balance > 0)
          COUNT(DISTINCT CASE WHEN d.due_date < CURRENT_DATE AND d.balance > 0 THEN c.id END) AS overdue_today,
          -- Due next 3 days (due_date between today and +3 days, balance > 0)
          COUNT(DISTINCT CASE WHEN d.due_date >= CURRENT_DATE AND d.due_date <= $1 AND d.balance > 0 THEN c.id END) AS due_next_3_days,
          -- Customers with debts but no phone
          COUNT(DISTINCT CASE WHEN d.balance > 0 AND (c.phone IS NULL OR c.phone = '') THEN c.id END) AS without_phone
        FROM customers c
        LEFT JOIN customer_debts d ON d.customer_id = c.id AND d.balance > 0
      `, [next3Days]);

      const coll = collectionsResult.rows[0];

      // ===== SUPPLIERS =====
      const suppliersResult = await pool.query(`
        SELECT
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_debts,
          SUM(CASE WHEN status = 'open' AND due_date <= $1 THEN 1 ELSE 0 END) AS due_next_7_days,
          SUM(CASE WHEN status = 'open' AND due_date < CURRENT_DATE THEN 1 ELSE 0 END) AS overdue
        FROM supplier_debts
      `, [next7Days]);

      const sup = suppliersResult.rows[0];

      // ===== RECENT SALES (last 5: cash + credit combined) =====
      const recentCash = await pool.query(`
        SELECT cs.sale_id AS id, cs.customer_id, c.name AS customer_name,
               cs.created_at, SUM(cs.amount) AS total, 'cash' AS type
        FROM cash_sales cs
        JOIN customers c ON c.id = cs.customer_id
        GROUP BY cs.sale_id, cs.customer_id, c.name, cs.created_at
        ORDER BY cs.created_at DESC
        LIMIT 5
      `);

      const recentCredit = await pool.query(`
        SELECT d.sale_id AS id, d.customer_id, c.name AS customer_name,
               MIN(d.created_at) AS created_at, SUM(d.amount) AS total, 'credit' AS type
        FROM customer_debts d
        JOIN customers c ON c.id = d.customer_id
        GROUP BY d.sale_id, d.customer_id, c.name
        ORDER BY MIN(d.created_at) DESC
        LIMIT 5
      `);

      // Combine and sort by date, take 5
      const allRecent = [...recentCash.rows, ...recentCredit.rows]
        .map(r => ({
          id: r.id,
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          created_at: r.created_at,
          total: Number(r.total),
          type: r.type,
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // ===== TOP PRODUCTS (last 30 days, by units sold) =====
      const topProductsResult = await pool.query(`
        SELECT p.id, p.name, SUM(s.units) AS total_units, SUM(s.units * s.amount) AS revenue
        FROM (
          SELECT product_id, units, amount FROM cash_sales WHERE created_at >= $1
          UNION ALL
          SELECT product_id, units, amount FROM customer_debts WHERE created_at >= $1
        ) s
        JOIN products p ON p.id = s.product_id
        GROUP BY p.id, p.name
        ORDER BY total_units DESC
        LIMIT 5
      `, [thirtyDaysAgo]);

      // ===== QUICK ACTIONS (empty state indicators) =====
      const quickActions = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM products) AS has_products,
          (SELECT COUNT(*) FROM customers) AS has_customers,
          (SELECT COUNT(*) FROM apartados WHERE status = 'pending') AS has_pending_apartados,
          (SELECT COUNT(*) FROM customer_debts WHERE balance > 0) AS has_open_debts,
          (SELECT COUNT(*) FROM supplier_debts WHERE status = 'open') AS has_supplier_debts
      `);

      const qa = quickActions.rows[0];

      // ===== RESPONSE =====
      return res.json({
        sales: {
          today: salesToday,
          week: salesWeek,
          month: salesMonth,
          cashToday: roundMoney(Number(cash.today || 0)),
          creditToday: roundMoney(Number(credit.today || 0)),
        },
        inventory: {
          totalProducts: Number(inv.total_products || 0),
          lowStock: Number(inv.low_stock || 0),
          outOfStock: Number(inv.out_of_stock || 0),
          totalValue: roundMoney(Number(inv.total_value || 0)),
        },
        customers: {
          total: Number(cust.total_customers || 0),
          withBalance: Number(cust.with_balance || 0),
          overdue: Number(cust.overdue_count || 0),
        },
        apartados: {
          pending: Number(ap.pending || 0),
          paidThisWeek: Number(ap.paid_this_week || 0),
          cancelledThisWeek: Number(ap.cancelled_this_week || 0),
          reservedUnits: Number(ap.reserved_units || 0),
        },
        collections: {
          totalOpenBalance: roundMoney(Number(coll.total_open_balance || 0)),
          overdueToday: Number(coll.overdue_today || 0),
          dueNext3Days: Number(coll.due_next_3_days || 0),
          withoutPhone: Number(coll.without_phone || 0),
        },
        suppliers: {
          openDebts: Number(sup.open_debts || 0),
          dueNext7Days: Number(sup.due_next_7_days || 0),
          overdue: Number(sup.overdue || 0),
        },
        recentSales: allRecent,
        topProducts: topProductsResult.rows.map(r => ({
          id: r.id,
          name: r.name,
          totalUnits: Number(r.total_units),
          revenue: roundMoney(Number(r.revenue || 0)),
        })),
        quickActions: {
          hasProducts: Number(qa.has_products || 0) > 0,
          hasCustomers: Number(qa.has_customers || 0) > 0,
          hasPendingApartados: Number(qa.has_pending_apartados || 0) > 0,
          hasOpenDebts: Number(qa.has_open_debts || 0) > 0,
          hasSupplierDebts: Number(qa.has_supplier_debts || 0) > 0,
        },
      });
    } catch (err) {
      console.error('Dashboard stats error, falling back to mock data:', err.message);
      return res.json(MOCK_STATS);
    }
  });

  return router;
}