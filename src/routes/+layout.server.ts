import { redirect } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import { authLogger } from '$lib/server/logger';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');

	if (!sessionToken) {
		if (url.pathname === '/login' || url.pathname === '/logout') {
			return { user: null };
		}
		authLogger.info({ event: 'no_session_token', pathname: url.pathname }, 'No session token found, redirecting to login');
		redirect(302, '/login');
	}

	authLogger.debug({ event: 'validating_session', pathname: url.pathname }, 'Validating session token');

	const { session, user } = await validateSessionToken(sessionToken);

	if (!session || !user) {
		authLogger.warn({ event: 'invalid_session', pathname: url.pathname }, 'Invalid session, deleting cookie and redirecting');
		cookies.delete('auth-session', { path: '/' });
		redirect(302, '/login');
	}

	authLogger.debug({ event: 'session_valid', userId: user.id, role: user.role, pathname: url.pathname }, 'Session is valid');

	return { user };
};