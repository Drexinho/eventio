import { Pool, PoolClient } from 'pg'

// Konfigurace databáze
const pool = new Pool({
  user: 'eventplanner',
  host: 'localhost',
  database: 'eventplanner',
  password: 'eventplanner123',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test připojení
pool.on('connect', () => {
  console.log('PostgreSQL připojení úspěšné')
})

pool.on('error', (err) => {
  console.error('PostgreSQL chyba:', err)
})

export { pool }

// Utility funkce pro získání klienta
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect()
}

// Utility funkce pro spuštění dotazu
export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

// Utility funkce pro spuštění transakce
export const transaction = async (callback: (client: PoolClient) => Promise<any>) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
} 