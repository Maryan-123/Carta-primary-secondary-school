import { Pool, PoolClient, QueryResultRow } from "pg";
import { env } from "./env";
import { SCHEMA_SEARCH_PATH } from "./constants";

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("connect", async (client: PoolClient) => {
  await client.query(`SET search_path TO ${SCHEMA_SEARCH_PATH}`);
});

pool.on("error", (error: Error) => {
  console.error("Unexpected PostgreSQL pool error", {
    message: error.message,
    name: error.name
  });
});

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  await client.query(`SET search_path TO ${SCHEMA_SEARCH_PATH}`);
  return client;
};

export const query = async <T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> => {
  const result = await pool.query<T>(text, params);
  return result.rows;
};

export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  await pool.query("SELECT 1");
  return true;
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
