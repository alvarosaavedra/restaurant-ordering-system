import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabaseSchema(testDbPath: string) {
	console.log('Setting up test database schema...');

	if (fs.existsSync(testDbPath)) {
		console.log('Removing old test database...');
		fs.unlinkSync(testDbPath);
	}

	console.log('Pushing schema to test database...');
	try {
		execSync('npx drizzle-kit push --force', {
			stdio: 'inherit',
			env: { ...process.env, DATABASE_URL: 'file:' + testDbPath }
		});
		console.log('✅ Schema pushed successfully');
	} catch (error) {
		console.error('❌ Error pushing schema:', error);
		throw error;
	}
}

export default async function globalSetup() {
	console.log('🌱 Setting up test database schema...');

	const numWorkers = 1;
	const baseDbPath = path.join(__dirname, '..', 'test-worker');

	for (let i = 0; i < numWorkers; i++) {
		const testDbPath = `${baseDbPath}-${i}.db`;
		process.env.DATABASE_URL = `file:${testDbPath}`;

		console.log(`Setting up worker ${i} database: ${testDbPath}`);
		await setupDatabaseSchema(testDbPath);
	}

	console.log('✅ Database schemas created successfully!');
}
