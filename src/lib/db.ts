import { Pool } from 'pg';

let pool: Pool | undefined;

if (!process.env.POSTGRES_URL) {
  console.warn(
    'POSTGRES_URL environment variable is not set. Database functionality will be limited or unavailable.'
  );
  // Depending on your app's needs, you might throw an error here,
  // or allow the app to run with limited (e.g., mock) data.
  // For now, the pool remains undefined, and functions using it must check.
} else {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // Example SSL configuration for production (adjust as needed):
    // ssl: {
    //   rejectUnauthorized: process.env.NODE_ENV === 'production', 
    //   // ca: process.env.PG_CA_CERT, // if you have a CA cert
    // },
  });

  pool.on('connect', () => {
    console.log('Successfully connected to PostgreSQL database via pool.');
  });

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client in PostgreSQL pool', err);
    // Consider a more robust error handling strategy for production,
    // e.g., attempting to reconnect or shutting down gracefully.
    process.exit(-1); 
  });
}

/**
 * Executes a SQL query against the database.
 * @param text The SQL query string. Can include placeholders like $1, $2.
 * @param params An array of parameters to substitute into the query.
 * @returns A Promise that resolves with the query result.
 * @throws Error if the database pool is not initialized.
 */
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    // If running in an environment where POSTGRES_URL might not be set (e.g. CI, local dev without DB)
    // you could return mock data here or throw a more specific error.
    console.error('Database pool is not initialized. Ensure POSTGRES_URL is set.');
    throw new Error('Database connection is not available.');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), duration, rowCount: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query:', { text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), error });
    throw error;
  }
};

// Export the pool directly if you need to manage transactions or use features not exposed by the query function.
export { pool };
