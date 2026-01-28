import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// @ts-expect-error - SvelteKit $env types are generated at build time
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Support both local SQLite and remote Turso databases
// For local dev: DATABASE_URL=file:local.db
// For Turso: DATABASE_URL=libsql://your-db.turso.io, TURSO_AUTH_TOKEN=your-token
const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
