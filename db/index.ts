import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";

let client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example → .env.local and point it at Postgres.",
    );
  }
  client ??= postgres(connectionString, { idle_timeout: 20, max_lifetime: 60 * 30 });
  return drizzle(client, { schema });
}

export const db = getDb();
export { schema };
