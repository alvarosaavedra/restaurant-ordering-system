import { redirect } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionToken = cookies.get('auth-session');
	
	// Check if we're on an auth route
	const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/logout');
	
	if (!sessionToken) {
		// If not authenticated and not on auth route, redirect to login
		if (!isAuthRoute) {
			redirect(302, '/login');
		}
		
		// Allow access to auth routes
		return { user: null };
	}

	const { session, user } = await validateSessionToken(sessionToken);
	
	if (!session || !user) {
		// Invalid session, clear cookie
		cookies.delete('auth-session', { path: '/' });
		
		// If not on auth route, redirect to login
		if (!isAuthRoute) {
			redirect(302, '/login');
		}
		
		// Allow access to auth routes
		return { user: null };
	}

	// If authenticated and on auth route, redirect to appropriate page
	if (isAuthRoute) {
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

	// For authenticated users, let the app layout handle protection
	return { user };
};