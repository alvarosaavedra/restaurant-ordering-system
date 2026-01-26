import { redirect } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');

	if (!sessionToken) {
		if (url.pathname === '/login' || url.pathname === '/logout') {
			return { user: null };
		}
		redirect(302, '/login');
	}

	const { session, user } = await validateSessionToken(sessionToken);

	if (!session || !user) {
		cookies.delete('auth-session', { path: '/' });
		redirect(302, '/login');
	}

	return { user };
};