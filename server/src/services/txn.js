/**
 * Run fn(client) inside a single DB transaction (design: stock- and
 * money-affecting mutations are all-or-nothing). Rolls back on any thrown
 * error and always releases the client, so a partial failure never leaves
 * quantity and record writes out of sync.
 */
export async function withTransaction(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
