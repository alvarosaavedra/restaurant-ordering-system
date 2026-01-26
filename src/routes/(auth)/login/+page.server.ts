import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { validateSessionToken, createSession, setSessionTokenCookie, generateSessionToken } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');

	if (!sessionToken) {
		redirect(302, '/login');
	}

	const { session, user } = await validateSessionToken(sessionToken);

	if (!session || !user) {
		cookies.delete('auth-session', { path: '/' });
		redirect(302, '/login');
	}

	return { user };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, email));

		if (!existingUser) {
			return fail(400, { error: 'Invalid email or password' });
		}

		if (existingUser.passwordHash !== password) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie({ request }, sessionToken, session.expiresAt);

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
