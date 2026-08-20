-- ============================================================================
-- Inventario — PostgreSQL schema
-- Greenfield. Idempotent: safe to re-run (CREATE TABLE IF NOT EXISTS,
-- CREATE OR REPLACE VIEW, CREATE INDEX IF NOT EXISTS). Applied by
-- `npm run db:migrate`.
--
-- Conventions
--   * UUID primary keys via gen_random_uuid() (native since Postgres 13).
--   * Money as NUMERIC(12,2), stock as INTEGER. All amounts checked > 0.
--   * TIMESTAMPTZ timestamps defaulting to now().
--   * Referential integrity: RESTRICT on delete (financial/stock records
--     are never cascade-deleted; guarded deletes happen at the API layer).
--   * Product state is DERIVED at query time (see product_states view),
--     never stored — drift is impossible by construction.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- products — catalog + current physical stock.
-- quantity is decremented atomically (same TXN) when units are reserved by
-- an apartado or committed to a credit sale, and incremented on cancellation
-- or restock. It therefore NEVER includes reserved, on-credit, or sold units.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  quantity    INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);

-- ---------------------------------------------------------------------------
-- customers — phone is optional; it is REQUIRED to render wa.me links.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_name_idx ON customers (name);

-- ---------------------------------------------------------------------------
-- apartados — layaway reservations. Lifecycle: pending -> paid | cancelled.
--   * units were decremented from products.quantity in the create TXN.
--   * cancel restores stock (guarded: only from 'pending'); pay does NOT.
--   * no automatic expiry: an apartado stays 'pending' until paid/cancelled.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS apartados (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers (id),
  product_id   UUID NOT NULL REFERENCES products (id),
  units        INTEGER     NOT NULL CHECK (units > 0),
  agreed_price NUMERIC(12,2) NOT NULL CHECK (agreed_price > 0), -- total agreed
  due_date     DATE,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS apartados_customer_idx ON apartados (customer_id);
CREATE INDEX IF NOT EXISTS apartados_product_idx  ON apartados (product_id);
CREATE INDEX IF NOT EXISTS apartados_status_due_idx ON apartados (status, due_date);

-- ---------------------------------------------------------------------------
-- apartado_payments — partial payments recorded against an apartado
-- (approved amendment B). Cumulative payments may not exceed agreed_price
-- (enforced in the API TXN); the apartado flips to 'paid' when cumulative
-- >= agreed_price. Paying does NOT return units to stock.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS apartado_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartado_id UUID NOT NULL REFERENCES apartados (id),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  note        TEXT
);

CREATE INDEX IF NOT EXISTS apartado_payments_apartado_idx
  ON apartado_payments (apartado_id);

-- ---------------------------------------------------------------------------
-- customer_debts — one row per product line of a credit sale, grouped by a
-- shared sale_id (no separate header table). FIFO allocation operates
-- directly on these rows, ordered by (created_at, id). Lifecycle:
-- open -> closed (balance 0). units were decremented from products.quantity
-- in the same TXN that inserted the debt.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  product_id  UUID NOT NULL REFERENCES products (id),
  sale_id     UUID NOT NULL,                 -- grouping key for the credit sale
  units       INTEGER     NOT NULL CHECK (units > 0),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),   -- line total
  balance     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  due_date    DATE,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS customer_debts_fifo_idx
  ON customer_debts (customer_id, status, created_at, id);
CREATE INDEX IF NOT EXISTS customer_debts_status_due_idx
  ON customer_debts (status, due_date);
CREATE INDEX IF NOT EXISTS customer_debts_product_idx
  ON customer_debts (product_id);            -- serves the product_states view

-- ---------------------------------------------------------------------------
-- payments — abonos (free-amount installments) received from a customer.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  note        TEXT
);

CREATE INDEX IF NOT EXISTS payments_customer_paid_idx
  ON payments (customer_id, paid_at);

-- ---------------------------------------------------------------------------
-- payment_allocations — how each payment was applied to open debts (FIFO).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_allocations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments (id),
  debt_id    UUID NOT NULL REFERENCES customer_debts (id),
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS payment_allocations_payment_idx
  ON payment_allocations (payment_id);
CREATE INDEX IF NOT EXISTS payment_allocations_debt_idx
  ON payment_allocations (debt_id);

-- ---------------------------------------------------------------------------
-- cash-sales — individual line items of a cash sale, grouped by a shared
-- sale_id (no separate header table, like customer_debts for credit sales).
--   * units decremented from products.quantity in the create TXN.
--   * grouped by sale_id so one sale can have multiple product lines.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cash_sales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  product_id  UUID NOT NULL REFERENCES products (id),
  sale_id     UUID NOT NULL,                 -- grouping key for the cash sale
  units       INTEGER     NOT NULL CHECK (units > 0),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),   -- line total
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cash_sales_customer_idx ON cash_sales (customer_id);
CREATE INDEX IF NOT EXISTS cash_sales_product_idx  ON cash_sales (product_id);
CREATE INDEX IF NOT EXISTS cash_sales_sale_idx     ON cash_sales (sale_id);

-- ---------------------------------------------------------------------------
-- suppliers — auto-upserted by name (unique) when a supplier debt is created.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- supplier_debts — money owed to suppliers. No stock linkage by design:
-- adding stock NEVER creates a supplier debt.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_debts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers (id),
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  due_date   DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open'
             CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS supplier_debts_status_due_idx
  ON supplier_debts (status, due_date);
CREATE INDEX IF NOT EXISTS supplier_debts_supplier_idx
  ON supplier_debts (supplier_id);

-- ---------------------------------------------------------------------------
-- supplier_payments — payments against a supplier debt (overpayment rejected
-- in the API TXN; the debt closes at balance 0).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_payments (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id  UUID NOT NULL REFERENCES supplier_debts (id),
  amount   NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS supplier_payments_debt_idx
  ON supplier_payments (debt_id);

-- ---------------------------------------------------------------------------
-- admins — single shared admin credential set (no roles). Seeded from env
-- (ADMIN_USERNAME / ADMIN_PASSWORD) when the table is empty; never hardcoded.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- bcrypt
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- product_states — derived per-unit state breakdown (approved amendment A).
-- Updated S1: added cash-sales contribution to sold_units and total_units.
--
-- Columns
--   apartado_units  units currently reserved by PENDING apartados
--   credit_units    units currently held by OPEN credit debts
--   sold_units      lifetime sold: PAID apartado units + CLOSED debt units
--                   + cash-sale units (new in S1)
--   available_units units currently free in stock
--   total_units     available + apartado + credit + sold (display helper)
--   state           dominant display state, precedence
--                   apartado > credit > available > sold
--                   (unchanged — cash units only feed 'sold' fallback when
--                    quantity = 0, so products.js filter set remains valid)
--
-- NOTE on available_units: products.quantity ALREADY excludes reserved and
-- on-credit units (they are decremented atomically in the same TXN that
-- creates the apartado/debt). available_units is therefore products.quantity
-- itself. Re-subtracting pending/credit units would double-count and go
-- negative (e.g. quantity 5, apartado 2 -> stock 3, available must be 3).
-- The amendment formula "quantity - pending - open" assumed a model where
-- quantity is a lifetime total; the spec + design mandate the decrement
-- model instead, so the view follows the decrement model.
-- ============================================================================
CREATE OR REPLACE VIEW product_states AS
SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.quantity,
  p.created_at,
  p.updated_at,
  COALESCE(ap.pending_units, 0)::int AS apartado_units,
  COALESCE(cd.open_units, 0)::int    AS credit_units,
  (
    COALESCE(ap.paid_units, 0)
    + COALESCE(cd.closed_units, 0)
    + COALESCE(cs.units, 0)
  )::int                              AS sold_units,
  p.quantity                          AS available_units,
  (
    p.quantity
    + COALESCE(ap.pending_units, 0)
    + COALESCE(cd.open_units, 0)
    + COALESCE(ap.paid_units, 0)
    + COALESCE(cd.closed_units, 0)
    + COALESCE(cs.units, 0)
  )::int                              AS total_units,
  CASE
    WHEN COALESCE(ap.pending_units, 0) > 0 THEN 'apartado'
    WHEN COALESCE(cd.open_units, 0) > 0 THEN 'credit'
    WHEN p.quantity > 0 THEN 'available'
    ELSE 'sold'
  END AS state
FROM products p
LEFT JOIN (
  SELECT product_id,
         SUM(units) FILTER (WHERE status = 'pending') AS pending_units,
         SUM(units) FILTER (WHERE status = 'paid')    AS paid_units
  FROM apartados
  GROUP BY product_id
) ap ON ap.product_id = p.id
LEFT JOIN (
  SELECT product_id,
         SUM(units) FILTER (WHERE status = 'open')   AS open_units,
         SUM(units) FILTER (WHERE status = 'closed') AS closed_units
  FROM customer_debts
  GROUP BY product_id
) cd ON cd.product_id = p.id
LEFT JOIN (
  SELECT product_id, SUM(units) AS units
  FROM cash_sales
  GROUP BY product_id
) cs ON cs.product_id = p.id;
