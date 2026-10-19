import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { badRequest, conflict, isUuid, notFound } from '../http.js';
import { withTransaction } from '../services/txn.js';
import { toDateString } from '../lib/dates.js';

/**
 * Products routes (task 3.1):
 *   GET    /api/products?search&state  list with derived state (view) + open counts
 *   POST   /api/products               create {name, description?, price?, quantity?}
 *                                     (initial stock; NO supplier linkage by design)
 *   GET    /api/products/:id           detail + open apartados/debts
 *   PATCH  /api/products/:id           edit fields; quantity is a SIGNED stock
 *                                     adjustment (restock +n, removal -n) in a TXN,
 *                                     never allowed to drive quantity below 0
 *   DELETE /api/products/:id           only when quantity = 0 and no open records (TXN)
 *
 * Variant sub-routes (Fase 1 — variantes de producto):
 *   POST   /api/products/:id/variants
 *          Body: { name, sku?, stock?, min_stock?, critical_stock?, position?,
 *                  attributes: [{ name, value, position? }] }
 *          Creates the variant and its attributes in one TXN; answers 201 (R1, R5).
 *   GET    /api/products/:id/variants  lists variants sorted by position with
 *          their attributes (R2).
 *   PATCH  /api/products/:id/variants/:variantId/stock
 *          Body: { delta } (signed integer). Rejected when stock would drop
 *          below 0; stock is left unchanged (R3).
 *   PATCH  /api/products/:id/variants/:variantId/active
 *          Body: { active }. Inactive variants are excluded from the parent
 *          SUM and the UI (R4).
 *
 * All variant mutations run inside withTransaction, so concurrent mutations on
 * the same variant are all-or-nothing (R12). The parent's general stock is
 * derived at query time in product_states (SUM of active variant stock,
 * fallback to products.quantity — R6, R7).
 *
 * All routes require an authenticated session (spec: every business endpoint
 * answers 401 without one). The pool is injected, same pattern as auth/health.
 */

// Allowed derived states (product_states view precedence:
// apartado > credit > available > sold).
const PRODUCT_STATES = new Set(['available', 'apartado', 'credit', 'sold']);

// Base product row: every column of the product_states view plus per-product
// counts of open records (used by the frontend delete guard and list badges).
const PRODUCT_SELECT = `
  SELECT v.*,
    (SELECT COUNT(*) FROM apartados a
      WHERE a.product_id = v.id AND a.status = 'pending')::int AS open_apartado_count,
    (SELECT COUNT(*) FROM customer_debts d
      WHERE d.product_id = v.id AND d.status = 'open')::int AS open_debt_count
  FROM product_states v
`;

const OPEN_APARTADOS_SQL = `
  SELECT a.id, a.units, a.agreed_price, a.due_date, a.status, a.created_at,
         c.name AS customer_name
  FROM apartados a
  JOIN customers c ON c.id = a.customer_id
  WHERE a.product_id = $1 AND a.status = 'pending'
  ORDER BY a.created_at ASC
`;

const OPEN_DEBTS_SQL = `
  SELECT d.id, d.units, d.amount, d.balance, d.due_date, d.status, d.created_at,
         c.name AS customer_name
  FROM customer_debts d
  JOIN customers c ON c.id = d.customer_id
  WHERE d.product_id = $1 AND d.status = 'open'
  ORDER BY d.created_at ASC
`;

/** pg returns NUMERIC as string; expose money as JSON numbers at the edge. */
function toProduct(row) {
  return { ...row, price: Number(row.price) };
}

function toOpenApartado(row) {
  return { ...row, agreed_price: Number(row.agreed_price), due_date: toDateString(row.due_date) };
}

function toOpenDebt(row) {
  return {
    ...row,
    amount: Number(row.amount),
    balance: Number(row.balance),
    due_date: toDateString(row.due_date),
  };
}

export default function productsRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const { search, state } = req.query;
    const where = [];
    const params = [];

    if (search !== undefined && search !== '') {
      params.push(`%${search}%`);
      where.push(`v.name ILIKE $${params.length}`);
    }
    if (state !== undefined && state !== '') {
      if (!PRODUCT_STATES.has(state)) {
        return badRequest(res, `Invalid state: ${state}`);
      }
      params.push(state);
      where.push(`v.state = $${params.length}`);
    }

    const sql =
      PRODUCT_SELECT +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ' ORDER BY v.name ASC';

    const { rows } = await pool.query(sql, params);
    return res.status(200).json({ products: rows.map(toProduct) });
  });

  router.post('/', async (req, res) => {
    const { name, description, price = 0, quantity = 0 } = req.body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      return badRequest(res, 'Product name is required');
    }
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== 'string'
    ) {
      return badRequest(res, 'Description must be a string or null');
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      return badRequest(res, 'Price must be a non-negative number');
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return badRequest(res, 'Quantity must be a non-negative integer');
    }

    const { rows } = await pool.query(
      'INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
      [name.trim(), description ?? null, price, quantity]
    );

    // NOTE: reading the created row through the view MUST be a separate
    // statement. A data-modifying CTE shares the statement snapshot, so the
    // main query cannot see the row it just inserted (Postgres docs: "RETURNING
    // data is the only way to communicate changes between different WITH
    // sub-statements and the main query") — the old WITH ... JOIN returned
    // zero rows and crashed toProduct.
    const { rows: productRows } = await pool.query(
      `${PRODUCT_SELECT} WHERE v.id = $1`,
      [rows[0].id]
    );

    return res.status(201).json({ product: toProduct(productRows[0]) });
  });

  router.get('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');

    const { rows } = await pool.query(
      `${PRODUCT_SELECT} WHERE v.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return notFound(res, 'Product not found');

    const [apartados, debts] = await Promise.all([
      pool.query(OPEN_APARTADOS_SQL, [req.params.id]),
      pool.query(OPEN_DEBTS_SQL, [req.params.id]),
    ]);

    return res.status(200).json({
      product: toProduct(rows[0]),
      open_apartados: apartados.rows.map(toOpenApartado),
      open_debts: debts.rows.map(toOpenDebt),
    });
  });

  router.patch('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');
    const { name, description, price, quantity } = req.body ?? {};

    const sets = [];
    const params = [];
    const add = (column, value) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return badRequest(res, 'Product name is required');
      }
      add('name', name.trim());
    }
    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return badRequest(res, 'Description must be a string or null');
      }
      add('description', description);
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
        return badRequest(res, 'Price must be a non-negative number');
      }
      add('price', price);
    }

    let adjustment = null;
    if (quantity !== undefined) {
      // Signed stock adjustment: positive restocks, negative removes units.
      if (!Number.isInteger(quantity)) {
        return badRequest(res, 'Quantity adjustment must be an integer');
      }
      adjustment = quantity;
    }

    if (sets.length === 0 && adjustment === null) {
      return badRequest(res, 'No fields to update');
    }

    const qtyParam = params.length + 1;
    const idParam = params.length + 2;
    const setClause = sets.length ? `${sets.join(', ')}, ` : '';

    const result = await withTransaction(pool, async (client) => {
      // Guarded single-statement update: the row is only touched when the
      // adjustment keeps quantity >= 0 (spec: quantity MUST NOT go negative).
      const { rows } = await client.query(
        `UPDATE products
         SET ${setClause}quantity = quantity + $${qtyParam},
             updated_at = now()
         WHERE id = $${idParam} AND quantity + $${qtyParam} >= 0
         RETURNING id`,
        [...params, adjustment ?? 0, req.params.id]
      );
      if (rows.length === 0) return { status: 'missing-or-blocked' };

      const { rows: productRows } = await client.query(
        `${PRODUCT_SELECT} WHERE v.id = $1`,
        [req.params.id]
      );
      return { status: 'ok', product: productRows[0] };
    });

    if (result.status === 'missing-or-blocked') {
      // Distinguish "no such product" from "adjustment would go negative".
      const check = await pool.query(
        'SELECT 1 FROM products WHERE id = $1',
        [req.params.id]
      );
      if (check.rows.length === 0) return notFound(res, 'Product not found');
      return badRequest(
        res,
        'Insufficient stock — quantity cannot go below 0'
      );
    }

    return res.status(200).json({ product: toProduct(result.product) });
  });

  router.delete('/:id', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');

    const result = await withTransaction(pool, async (client) => {
      const { rows } = await client.query(
        'SELECT quantity FROM products WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (rows.length === 0) return { status: 'not-found' };
      if (rows[0].quantity > 0) return { status: 'has-stock' };

      // Open records would make the delete unsafe for stock integrity.
      const open = await client.query(
        `SELECT
           (SELECT COUNT(*) FROM apartados a
             WHERE a.product_id = $1 AND a.status = 'pending')
           +
           (SELECT COUNT(*) FROM customer_debts d
             WHERE d.product_id = $1 AND d.status = 'open') AS n`,
        [req.params.id]
      );
      if (Number(open.rows[0].n) > 0) return { status: 'has-open-records' };

      try {
        await client.query('DELETE FROM products WHERE id = $1', [
          req.params.id,
        ]);
      } catch (err) {
        // Paid apartados / closed debts still reference the product
        // (FK RESTRICT); translate that into a clean conflict response.
        if (err.code === '23503') return { status: 'has-history' };
        throw err;
      }
      return { status: 'ok' };
    });

    switch (result.status) {
      case 'not-found':
        return notFound(res, 'Product not found');
      case 'has-stock':
        return conflict(res, 'Cannot delete a product with stock remaining');
      case 'has-open-records':
        return conflict(
          res,
          'Cannot delete a product with open apartados or debts'
        );
      case 'has-history':
        return conflict(
          res,
          'Cannot delete a product with sales history'
        );
      default:
        return res.status(200).json({ ok: true });
    }
  });

  // ---------------------------------------------------------------------------
  // Variant sub-routes mounted under /:id/variants (product_id = req.params.id).
  // ---------------------------------------------------------------------------
  // mergeParams: true para que req.params.id (producto padre) sea visible
  // dentro de este sub-router montado bajo /:id/variants.
  const variantRoutes = Router({ mergeParams: true });

  /** Shape of a variant row + its attributes, as returned by the API. */
  function toVariantRow(row, attributes = []) {
    return {
      ...row,
      attributes: attributes.map((a) => ({
        id: a.id,
        variant_id: a.variant_id,
        attribute_name: a.attribute_name,
        attribute_value: a.attribute_value,
        position: a.position,
      })),
    };
  }

  /** Validates and normalizes the variant create body. Returns { error } or
   *  the normalized input. Attribute input accepts { name, value } (spec) as
   *  well as { attribute_name, attribute_value }. */
  function normalizeVariantInput(body) {
    const {
      name,
      sku,
      stock = 0,
      min_stock = 0,
      critical_stock = 0,
      position = 0,
      attributes = [],
    } = body ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      return { error: 'Variant name is required' };
    }
    if (sku !== undefined && sku !== null && typeof sku !== 'string') {
      return { error: 'SKU must be a string' };
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return { error: 'Stock must be a non-negative integer' };
    }
    if (!Number.isInteger(min_stock) || min_stock < 0) {
      return { error: 'min_stock must be a non-negative integer' };
    }
    if (!Number.isInteger(critical_stock) || critical_stock < 0) {
      return { error: 'critical_stock must be a non-negative integer' };
    }
    if (!Number.isInteger(position)) {
      return { error: 'Position must be an integer' };
    }
    if (!Array.isArray(attributes)) {
      return { error: 'Attributes must be an array' };
    }

    const normalized = [];
    for (const [index, attr] of attributes.entries()) {
      const attributeName = String(attr?.attribute_name ?? attr?.name ?? '').trim();
      const attributeValue = String(attr?.attribute_value ?? attr?.value ?? '').trim();
      if (attributeName === '' || attributeValue === '') {
        return { error: 'Attribute name and value are required' };
      }
      normalized.push({
        attribute_name: attributeName,
        attribute_value: attributeValue,
        position: Number.isInteger(attr?.position) ? attr.position : index,
      });
    }

    return {
      name: name.trim(),
      sku: sku ?? null,
      stock,
      min_stock,
      critical_stock,
      position,
      attributes: normalized,
    };
  }

  /** True when the product exists (guarded look-up before any variant write). */
  async function productExists(client, productId) {
    const { rows } = await client.query('SELECT 1 FROM products WHERE id = $1', [
      productId,
    ]);
    return rows.length > 0;
  }

  // POST /api/products/:id/variants — create variant + attributes in one TXN (R1, R5).
  variantRoutes.post('/', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');
    const input = normalizeVariantInput(req.body);
    if (input.error) return badRequest(res, input.error);

    let result;
    try {
      result = await withTransaction(pool, async (client) => {
        if (!(await productExists(client, req.params.id))) {
          return { status: 'not-found' };
        }
        const { rows } = await client.query(
          `INSERT INTO product_variants
           (product_id, name, sku, stock, min_stock, critical_stock, active, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, product_id, name, sku, stock, min_stock, critical_stock,
                     active, position, created_at, updated_at`,
          [
            req.params.id,
            input.name,
            input.sku,
            input.stock,
            input.min_stock,
            input.critical_stock,
            true,
            input.position,
          ]
        );
        const variant = rows[0];
        for (const attr of input.attributes) {
          await client.query(
            `INSERT INTO variant_attributes
             (variant_id, attribute_name, attribute_value, position)
             VALUES ($1, $2, $3, $4)`,
            [variant.id, attr.attribute_name, attr.attribute_value, attr.position]
          );
        }
        const { rows: attributes } = await client.query(
          `SELECT id, variant_id, attribute_name, attribute_value, position
           FROM variant_attributes
           WHERE variant_id = $1
           ORDER BY position ASC, id ASC`,
          [variant.id]
        );
        return { status: 'ok', variant: toVariantRow(variant, attributes) };
      });
    } catch (err) {
      // Duplicate SKU (unique index) -> clean 400 instead of a 500.
      if (err.code === '23505' && err.constraint === 'product_variants_sku_key') {
        return badRequest(res, 'SKU already exists');
      }
      throw err;
    }

    if (result.status === 'not-found') return notFound(res, 'Product not found');
    return res.status(201).json({ variant: result.variant });
  });

  // GET /api/products/:id/variants — sorted by position, with attributes (R2).
  variantRoutes.get('/', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');

    const { rows: productRows } = await pool.query(
      'SELECT 1 FROM products WHERE id = $1',
      [req.params.id]
    );
    if (productRows.length === 0) return notFound(res, 'Product not found');

    const { rows: variants } = await pool.query(
      `SELECT id, product_id, name, sku, stock, min_stock, critical_stock,
              active, position, created_at, updated_at
       FROM product_variants
       WHERE product_id = $1
       ORDER BY position ASC, name ASC, id ASC`,
      [req.params.id]
    );

    const attributesByVariant = {};
    if (variants.length > 0) {
      const ids = variants.map((v) => v.id);
      const { rows: attributes } = await pool.query(
        `SELECT id, variant_id, attribute_name, attribute_value, position
         FROM variant_attributes
         WHERE variant_id = ANY($1)
         ORDER BY variant_id ASC, position ASC, id ASC`,
        [ids]
      );
      for (const attr of attributes) {
        (attributesByVariant[attr.variant_id] ??= []).push(attr);
      }
    }

    return res.status(200).json({
      variants: variants.map((v) => toVariantRow(v, attributesByVariant[v.id] ?? [])),
    });
  });

  // PATCH /api/products/:id/variants/:variantId/stock — signed delta, >= 0 enforced (R3).
  variantRoutes.patch('/:variantId/stock', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');
    if (!isUuid(req.params.variantId)) return notFound(res, 'Variant not found');
    const { delta } = req.body ?? {};
    if (!Number.isInteger(delta)) {
      return badRequest(res, 'Delta must be an integer');
    }

    const result = await withTransaction(pool, async (client) => {
      const { rows } = await client.query(
        `UPDATE product_variants
         SET stock = stock + $1, updated_at = now()
         WHERE id = $2 AND stock + $1 >= 0
         RETURNING stock`,
        [delta, req.params.variantId]
      );
      if (rows.length === 0) return { status: 'missing-or-blocked' };
      return { status: 'ok', stock: rows[0].stock };
    });

    if (result.status === 'missing-or-blocked') {
      const check = await pool.query(
        `SELECT 1 FROM product_variants
         WHERE id = $1 AND product_id = $2`,
        [req.params.variantId, req.params.id]
      );
      if (check.rows.length === 0) return notFound(res, 'Variant not found');
      return badRequest(
        res,
        'Insufficient stock — variant stock cannot go below 0'
      );
    }

    return res.status(200).json({
      variant: { id: req.params.variantId, stock: result.stock },
    });
  });

  // PATCH /api/products/:id/variants/:variantId/active — exclude from SUM/UI (R4).
  variantRoutes.patch('/:variantId/active', async (req, res) => {
    if (!isUuid(req.params.id)) return notFound(res, 'Product not found');
    if (!isUuid(req.params.variantId)) return notFound(res, 'Variant not found');
    const { active } = req.body ?? {};
    if (typeof active !== 'boolean') {
      return badRequest(res, 'Active must be a boolean');
    }

    const result = await withTransaction(pool, async (client) => {
      const { rows } = await client.query(
        `UPDATE product_variants SET active = $1, updated_at = now()
         WHERE id = $2
         RETURNING id`,
        [active, req.params.variantId]
      );
      if (rows.length === 0) return { status: 'not-found' };
      return { status: 'ok' };
    });

    if (result.status === 'not-found') return notFound(res, 'Variant not found');
    return res.status(200).json({ ok: true });
  });

  router.use('/:id/variants', variantRoutes);

  return router;
}
