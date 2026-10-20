-- cleanup-old-products.sql
-- Revisa y borra productos viejos que NO están en la lista de ropa.
-- Ejecuta contra tu BD de producción con psql o tu cliente SQL preferido.
-- Requiere DATABASE_URL configurada.

-- 1. Ver qué se va a borrar (revisar antes de borrar)
SELECT id, name, price, quantity
FROM products
WHERE name <> ALL(ARRAY[
  'Remera Básica Algodón Blanca',
  'Remera Básica Algodón Negra',
  'Jean Slim Fit Hombre Azul',
  'Jean Skinny Mujer Negro',
  'Buzo Canguro Algodón Gris',
  'Buzo Canguro Algodón Negro',
  'Camisa Oxford Manga Larga Blanca',
  'Camisa Oxford Manga Larga Celeste',
  'Vestido Midi Floral Verano',
  'Vestido Largo Negro Elegante',
  'Zapatillas Urbanas Blancas',
  'Zapatillas Urbanas Negras',
  'Campera Rompevientos Negra',
  'Campera Denim Clásica',
  'Short Deportivo Gris',
  'Short Denim Azul Claro',
  'Medias Deportivas Pack x3',
  'Gorra Trucker Negra',
  'Cinturón Cuero Marrón',
  'Bufanda Lana Beige'
]);

-- 2. Borrar dependencias (FK RESTRICT, orden importa)
-- DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE name <> ALL(...));
-- DELETE FROM apartados WHERE product_id IN (...);
-- DELETE FROM customer_debts WHERE product_id IN (...);
-- DELETE FROM cash_sales WHERE product_id IN (...);

-- 3. Borrar productos viejos
-- DELETE FROM products WHERE name <> ALL(ARRAY[...]);

-- 4. Reseed: correr luego npm run seed:prod o node server/scripts/seed-production.js
