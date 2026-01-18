import { redirect } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { deleteSessionTokenCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('auth-session');
		
		if (sessionToken) {
			// Calculate session ID the same way as in auth.ts
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
			
			// Delete session from database
			await db.delete(session).where(eq(session.id, sessionId));
			
			// Delete session cookie
			deleteSessionTokenCookie({ cookies } as any);
		}
		
		redirect(302, '/login');
	}
};