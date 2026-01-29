import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import { authLogger } from '$lib/server/logger';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

interface CookieOptions {
	expires?: Date;
	path?: string;
	sameSite?: 'lax' | 'strict' | 'none';
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	authLogger.info({ event: 'session_created', userId, sessionId, expiresAt: session.expiresAt }, 'New session created');
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: { id: table.user.id, name: table.user.name, email: table.user.email, role: table.user.role },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		authLogger.debug({ event: 'session_not_found', sessionId }, 'Session not found in database');
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		authLogger.info({ event: 'session_expired', sessionId, userId: user.id }, 'Session expired, deleting');
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
		authLogger.info({ event: 'session_renewed', sessionId, userId: user.id, newExpiresAt: session.expiresAt }, 'Session renewed');
	}

	authLogger.debug({ event: 'session_validated', sessionId, userId: user.id }, 'Session validated successfully');

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
	authLogger.info({ event: 'session_invalidated', sessionId }, 'Session invalidated');
}

export function setSessionTokenCookie(event: RequestEvent | { request: Request }, token: string, expiresAt: Date) {
	const request = 'request' in event ? (event as { request: Request }).request : event;
	if (request && 'cookies' in request) {
		(request as Request & { cookies: { set: (name: string, value: string, opts: CookieOptions) => void } }).cookies.set(sessionCookieName, token, {
			expires: expiresAt,
			path: '/',
			sameSite: 'lax'
		});
	}
}

export function deleteSessionTokenCookie(event: RequestEvent | { request: Request }) {
	const request = 'request' in event ? (event as { request: Request }).request : event;
	if (request && 'cookies' in request) {
		(request as Request & { cookies: { delete: (name: string, opts: CookieOptions) => void } }).cookies.delete(sessionCookieName, {
			path: '/'
		});
	}
}
