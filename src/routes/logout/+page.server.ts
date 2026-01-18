import { redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('auth-session');
		
		if (sessionToken) {
			// Invalidate session in database
			const sessionId = Buffer.from(sessionToken).toString('hex').substring(0, 64);
			await invalidateSession(sessionId);
			
			// Delete session cookie
			deleteSessionTokenCookie({ cookies } as any);
		}
		
		redirect(302, '/login');
	}
};