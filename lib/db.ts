import { Pool, QueryResult, QueryResultRow } from "pg";

let cached: Pool | undefined;

export function getPgPool(): Pool | null {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached = new Pool({ connectionString: url, max: 10 });
  return cached;
}

/** Convenience: run a single query and release. Returns rows. */
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPgPool();
  if (!pool) throw new Error("DATABASE_URL not configured");
  const client = await pool.connect();
  try {
    const result: QueryResult<T> = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/** Convenience: run a single query and return first row or null */
export async function dbQueryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows[0] ?? null;
}
