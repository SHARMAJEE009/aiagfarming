import { Pool } from "pg";

let cached: Pool | undefined;

export function getPgPool(): Pool | null {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }

  cached = new Pool({ connectionString: url });
  return cached;
}
