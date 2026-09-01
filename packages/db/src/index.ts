import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export * from './schema.js';

export function createDatabase(connectionString: string) {
  const pool = new Pool({ connectionString, max: 12, statement_timeout: 10_000 });
  return { db: drizzle({ client: pool, schema }), pool };
}

export type Database = ReturnType<typeof createDatabase>['db'];
