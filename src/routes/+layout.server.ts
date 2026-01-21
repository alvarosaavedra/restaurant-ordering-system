import { redirect } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');
	
	// If not logged in, only allow auth routes
	if (!sessionToken) {
		if (url.pathname === '/login' || url.pathname === '/logout') {
			return { user: null };
		}
		redirect(302, '/login');
	}

	const { session, user } = await validateSessionToken(sessionToken);
	
	// If session is invalid, clear and redirect to login
	if (!session || !user) {
		cookies.delete('auth-session', { path: '/' });
		redirect(302, '/login');
	}

	// If logged in and trying to access auth routes, redirect to appropriate page
	if (url.pathname === '/login' || url.pathname === '/logout') {
		switch (user.role) {
			case 'kitchen':
				redirect(302, '/kitchen');
				break;
			case 'delivery':
				redirect(302, '/delivery');
				break;
			case 'order_taker':
			default:
				redirect(302, '/orders/new');
		}
	}

	// For all other routes, return user data
	return { user };
};