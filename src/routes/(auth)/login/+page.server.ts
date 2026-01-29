import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { validateSessionToken, createSession, generateSessionToken } from '$lib/server/auth';
import { authLogger } from '$lib/server/logger';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get('auth-session');

	if (!sessionToken) {
		return {};
	}

	authLogger.debug({ event: 'validating_session' }, 'Validating existing session on login page');

	const { session, user } = await validateSessionToken(sessionToken);

	if (!session || !user) {
		authLogger.warn({ event: 'invalid_session' }, 'Invalid session found, deleting cookie');
		cookies.delete('auth-session', { path: '/' });
		return {};
	}

	authLogger.info(
		{ event: 'valid_session', userId: user.id, email: user.email, role: user.role },
		'Valid session found for user'
	);

	return { user };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			authLogger.warn({ event: 'login_attempt_missing_credentials', email }, 'Login attempt with missing credentials');
			return fail(400, { error: 'Email and password are required' });
		}

		authLogger.info({ event: 'login_attempt', email }, 'Login attempt');

		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, email));

		if (!existingUser) {
			authLogger.warn({ event: 'login_failed_user_not_found', email }, 'Login failed - user not found');
			return fail(400, { error: 'Invalid email or password' });
		}

		if (existingUser.passwordHash !== password) {
			authLogger.warn({ event: 'login_failed_incorrect_password', email, userId: existingUser.id }, 'Login failed - incorrect password');
			return fail(400, { error: 'Invalid email or password' });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);

		cookies.set('auth-session', sessionToken, {
			expires: session.expiresAt,
			path: '/',
			httpOnly: false,
			secure: false,
			sameSite: 'lax'
		});

		authLogger.info(
			{
				event: 'login_successful',
				userId: existingUser.id,
				email: existingUser.email,
				role: existingUser.role,
				expiresAt: session.expiresAt
			},
			'Login successful'
		);

		switch (existingUser.role) {
			case 'kitchen':
				redirect(302, '/kitchen');
				break;
			case 'delivery':
				redirect(302, '/delivery');
				break;
			case 'admin':
			case 'order_taker':
			default:
				redirect(302, '/orders/new');
		}
	}
};
