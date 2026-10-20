// Centralized seed data for Nexo (inventory/collections app).
// Single source of truth for clothing-store demo/production data.
// Imported by: server/src/index.js, server/scripts/seed-demo.js, server/scripts/seed-production.js

// Realistic clothing store customer names (Argentine names with phones)
export const CUSTOMER_NAMES = [
  { name: 'María Fernanda González', phone: '+54 9 11 1234 5678' },
  { name: 'Carlos Andrés Martínez', phone: '+54 9 11 8765 4321' },
  { name: 'Laura Beatriz Silva', phone: null },
  { name: 'Roberto Carlos Fernández', phone: '+54 9 11 5555 7777' },
  { name: 'Sofía Valentina Rodríguez', phone: null },
  { name: 'Diego Armando Torres', phone: '+54 9 11 3333 4444' },
  { name: 'Camila Andrea Herrera', phone: null },
  { name: 'Julián Esteban Gómez', phone: '+54 9 11 2222 1111' },
  { name: 'Valentina Lucía Díaz', phone: null },
  { name: 'Facundo Nicolás Pérez', phone: '+54 9 11 6666 8888' },
  { name: 'Lucía Celeste Martínez', phone: null },
  { name: 'Nicolás Andrés Sánchez', phone: '+54 9 11 9999 0000' },
];

// Clothing store products (name, price in cents, quantity)
export const PRODUCT_NAMES = [
  { name: 'Remera Básica Algodón Blanca', price: 8900, quantity: 50 },
  { name: 'Remera Básica Algodón Negra', price: 8900, quantity: 45 },
  { name: 'Jean Slim Fit Hombre Azul', price: 24900, quantity: 30 },
  { name: 'Jean Skinny Mujer Negro', price: 22900, quantity: 35 },
  { name: 'Buzo Canguro Algodón Gris', price: 18900, quantity: 25 },
  { name: 'Buzo Canguro Algodón Negro', price: 18900, quantity: 20 },
  { name: 'Camisa Oxford Manga Larga Blanca', price: 15900, quantity: 20 },
  { name: 'Camisa Oxford Manga Larga Celeste', price: 15900, quantity: 15 },
  { name: 'Vestido Midi Floral Verano', price: 19900, quantity: 18 },
  { name: 'Vestido Largo Negro Elegante', price: 22900, quantity: 12 },
  { name: 'Zapatillas Urbanas Blancas', price: 34900, quantity: 22 },
  { name: 'Zapatillas Urbanas Negras', price: 34900, quantity: 20 },
  { name: 'Campera Rompevientos Negra', price: 28900, quantity: 15 },
  { name: 'Campera Denim Clásica', price: 32900, quantity: 10 },
  { name: 'Short Deportivo Gris', price: 9900, quantity: 30 },
  { name: 'Short Denim Azul Claro', price: 11900, quantity: 25 },
  { name: 'Medias Deportivas Pack x3', price: 2900, quantity: 100 },
  { name: 'Gorra Trucker Negra', price: 6900, quantity: 40 },
  { name: 'Cinturón Cuero Marrón', price: 9900, quantity: 25 },
  { name: 'Bufanda Lana Beige', price: 7900, quantity: 18 },
];
