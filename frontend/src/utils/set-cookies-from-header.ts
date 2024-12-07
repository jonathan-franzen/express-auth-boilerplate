'use server';

import { parse } from 'cookie';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

export async function setCookiesFromHeader(setCookieHeader: string[]): Promise<void> {
	const cookieStore: ReadonlyRequestCookies = await cookies();

	setCookieHeader.forEach((cookie: string): void => {
		const parsedCookie: Record<string, string | undefined> = parse(cookie);

		const cookieName: string = Object.keys(parsedCookie)[0];
		const cookieValue: string | undefined = parsedCookie[cookieName];

		if (cookieValue) {
			cookieStore.set(cookieName, cookieValue, {
				path: parsedCookie['Path'] || '/',
				httpOnly: parsedCookie.HttpOnly === 'true',
				secure: parsedCookie.Secure === 'true',
				sameSite: ('strict' as 'strict' | 'lax' | 'none') || 'lax',
				maxAge: parsedCookie['Max-Age'] ? parseInt(parsedCookie['Max-Age']) : 60 * 60,
			});
		}
	});
}
