import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import * as schema from '../src/lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
	url: DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});

const db = drizzle(client, { schema });

async function addAdminUser() {
	const args = process.argv.slice(2);
	
	// Parse arguments
	let name = 'Admin User';
	let email = 'admin@example.com';
	let password = 'admin123';
	
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--name' && args[i + 1]) {
			name = args[i + 1];
			i++;
		} else if (args[i] === '--email' && args[i + 1]) {
			email = args[i + 1];
			i++;
		} else if (args[i] === '--password' && args[i + 1]) {
			password = args[i + 1];
			i++;
		}
	}
	
	console.log(`Adding admin user: ${name} (${email})`);
	
	try {
		// Check if user already exists
		const existingUser = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, email)
		});
		
		if (existingUser) {
			console.error(`User with email ${email} already exists!`);
			process.exit(1);
		}
		
		// Create admin user
		const newUser = {
			id: nanoid(),
			name,
			email,
			passwordHash: password,
			role: 'admin' as const,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		
		await db.insert(schema.user).values(newUser);
		
		console.log('✓ Admin user created successfully!');
		console.log(`  ID: ${newUser.id}`);
		console.log(`  Name: ${name}`);
		console.log(`  Email: ${email}`);
		console.log(`  Password: ${password}`);
		console.log(`  Role: admin`);
	} catch (error) {
		console.error('Error creating admin user:', error);
		process.exit(1);
	}
	
	process.exit(0);
}

addAdminUser();
