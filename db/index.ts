import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;

function connect(): Db {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example → .env.local and point it at Postgres.",
    );
  }
  const client = postgres(connectionString, { idle_timeout: 20, max_lifetime: 60 * 30 });
  return drizzle(client, { schema });
}

/**
 * Lazy DB handle — connection is only established on first query, so importing
 * this module never throws at build time (Vercel collects page data before env
 * vars are injected). Throws on first actual use if DATABASE_URL is missing.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    _db ??= connect();
    const value = (_db as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(_db) : value;
  },
}) as Db;

export { schema };
