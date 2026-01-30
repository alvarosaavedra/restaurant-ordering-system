import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/server/db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the same database path as playwright.config.ts
const testDbPath = path.join(__dirname, '..', 'test.db');

async function setupDatabaseSchema(dbPath: string) {
	console.log('Setting up test database schema...');

	// Check if we need to push schema (either DB doesn't exist or tables are missing)
	let needsSchemaPush = false;
	
	if (!fs.existsSync(dbPath)) {
		needsSchemaPush = true;
	} else {
		// Check if user table exists by trying to query it
		try {
			const db = drizzle(createClient({ url: 'file:' + dbPath }), { schema });
			await db.select().from(schema.user).limit(1);
		} catch {
			// Table doesn't exist, need to push schema
			needsSchemaPush = true;
		}
	}
	
	if (needsSchemaPush) {
		console.log('Creating new test database...');
		console.log('Pushing schema to test database...');
		try {
			execSync('npx drizzle-kit push --force', {
				stdio: 'inherit',
				env: { ...process.env, DATABASE_URL: 'file:' + dbPath }
			});
			console.log('✅ Schema pushed successfully');
		} catch (error) {
			console.error('❌ Error pushing schema:', error);
			throw error;
		}
	} else {
		console.log('Database schema already exists, skipping schema push');
	}
}

async function clearDatabase(dbPath: string) {
	console.log('Clearing existing test data...');
	
	const db = drizzle(createClient({ url: 'file:' + dbPath }), { schema });
	
	try {
		// Clear all tables in reverse order of dependencies
		await db.delete(schema.orderItem);
		await db.delete(schema.order);
		await db.delete(schema.session);
		await db.delete(schema.client);
		await db.delete(schema.menuItem);
		await db.delete(schema.category);
		await db.delete(schema.user);
		console.log('✅ Database cleared');
	} catch {
		// If tables don't exist yet, that's ok - just log and continue
		console.log('ℹ️ Some tables do not exist yet, skipping clear');
	}
}

async function seedTestData(dbPath: string) {
	console.log('Seeding test data...');

	const db = drizzle(createClient({ url: 'file:' + dbPath }), { schema });
	const now = new Date();

	// Create test users with predictable IDs so tests can reference them
	const testUsers = [
		{ id: 'user-order-taker', name: 'John Doe', email: 'john@bakery.com', passwordHash: 'password123', role: 'order_taker' },
		{ id: 'user-kitchen', name: 'Jane Smith', email: 'jane@bakery.com', passwordHash: 'password123', role: 'kitchen' },
		{ id: 'user-delivery', name: 'Mike Johnson', email: 'mike@bakery.com', passwordHash: 'password123', role: 'delivery' },
		{ id: 'user-admin', name: 'Admin User', email: 'admin@bakery.com', passwordHash: 'password123', role: 'admin' }
	];

	for (const userData of testUsers) {
		await db.insert(schema.user).values({
			...userData,
			createdAt: now,
			updatedAt: now
		});
	}

	// Create categories
	const categories = [
		{ id: 'cat-bakery', name: 'Bakery Items', displayOrder: 1 },
		{ id: 'cat-beverages', name: 'Beverages', displayOrder: 2 }
	];

	for (const cat of categories) {
		await db.insert(schema.category).values({
			...cat,
			createdAt: now
		});
	}

	// Create menu items
	const menuItems = [
		{ id: 'item-croissant', categoryId: 'cat-bakery', name: 'Croissant', description: 'Buttery French croissant', price: 3.49, isAvailable: true },
		{ id: 'item-bread', categoryId: 'cat-bakery', name: 'Fresh Bread', description: 'Artisan sourdough', price: 4.99, isAvailable: true },
		{ id: 'item-coffee', categoryId: 'cat-beverages', name: 'Coffee', description: 'Freshly brewed', price: 2.99, isAvailable: true }
	];

	for (const item of menuItems) {
		await db.insert(schema.menuItem).values({
			...item,
			createdAt: now
		});
	}

	console.log('✅ Test data seeded successfully');
}

export default async function globalSetup() {
	console.log('🌱 Setting up test environment...');

	console.log(`Setting up database: ${testDbPath}`);
	process.env.DATABASE_URL = `file:${testDbPath}`;
	
	// Only push schema if DB doesn't exist
	await setupDatabaseSchema(testDbPath);
	
	// Clear existing data and re-seed (safe to do even with existing connections)
	if (fs.existsSync(testDbPath)) {
		await clearDatabase(testDbPath);
	}
	await seedTestData(testDbPath);

	console.log('✅ Database setup complete!');
}
