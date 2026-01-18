import { redirect } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');
	
	if (!sessionToken) {
		// Allow access to login page when not authenticated
		if (url.pathname === '/login') {
			return { user: null };
		}
		
		// Redirect to login for all other routes
		redirect(302, '/login');
	}

	const { session, user } = await validateSessionToken(sessionToken);
	
	if (!session || !user) {
		// Invalid session, clear cookie and redirect to login
		cookies.delete('auth-session', { path: '/' });
		
		if (url.pathname === '/login') {
			return { user: null };
		}
		
		redirect(302, '/login');
	}

	// If authenticated user tries to access login, redirect to appropriate page
	if (url.pathname === '/login') {
		let redirectPath = '/';
		switch (user.role) {
			case 'kitchen':
				redirectPath = '/kitchen';
				break;
			case 'delivery':
				redirectPath = '/delivery';
				break;
			case 'order_taker':
			default:
				redirectPath = '/orders/new';
				break;
		}
		redirect(302, redirectPath);
	}

	return { user };
};