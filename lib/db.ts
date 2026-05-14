import { Pool } from "pg";

let cached: Pool | null | undefined;

export function getPgPool(): Pool | null {
  if (cached !== undefined) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    cached = null;
    return null;
  }
  cached = new Pool({ connectionString: url });
  return cached;
}
