import { redirect } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('auth-session');

		if (sessionToken) {
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));

			await db.delete(session).where(eq(session.id, sessionId));

			cookies.delete('auth-session', { path: '/' });
		}

		redirect(302, '/login');
	}
};