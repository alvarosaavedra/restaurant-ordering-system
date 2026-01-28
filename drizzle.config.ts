import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Support both local SQLite and remote Turso databases
// For local dev: DATABASE_URL=file:local.db
// For Turso: DATABASE_URL=libsql://your-db.turso.io, TURSO_AUTH_TOKEN=your-token
const dbCredentials = process.env.TURSO_AUTH_TOKEN
	? {
			url: process.env.DATABASE_URL,
			authToken: process.env.TURSO_AUTH_TOKEN
		}
	: { url: process.env.DATABASE_URL };

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials,
	verbose: true,
	strict: true
});
