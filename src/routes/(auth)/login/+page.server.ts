import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { validateSessionToken, createSession, setSessionTokenCookie, generateSessionToken } from '$lib/server/auth';
import type { Actions } from './$types';

	export const actions: Actions = {
		default: async ({ request, cookies }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			const password = data.get('password') as string;

			if (!email || !password) {
				return fail(400, { error: 'Email and password are required' });
			}

		// Find user by email
		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, email));

		if (!existingUser) {
			return fail(400, { error: 'Invalid email or password' });
		}

			// For MVP: Simple password check (plain text comparison)
			// In production: Use proper password hashing with bcrypt/argon2
			if (existingUser.passwordHash !== password) {
				return fail(400, { error: 'Invalid email or password' });
			}

		// Create session
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie({ cookies } as any, sessionToken, session.expiresAt);

		// Redirect based on user role
		switch (existingUser.role) {
			case 'kitchen':
				redirect(302, '/kitchen');
			case 'delivery':
				redirect(302, '/delivery');
			case 'admin':
			case 'order_taker':
			default:
				redirect(302, '/orders/new');
		}
	}
};