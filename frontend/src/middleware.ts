import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/constants/routes.constants';
import { MeUserBackendInterface } from '@/interfaces/backend/user/me.user.backend.interface';
import { validateRefreshToken } from '@/utils/validate-refresh-token';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest): Promise<NextResponse> {
	const path: string = req.nextUrl.pathname;
	const isPublicRoute: boolean = PUBLIC_ROUTES.includes(path);
	const isProtectedRoute: boolean = PROTECTED_ROUTES.includes(path);
	const cookieStore: ReadonlyRequestCookies = await cookies();

	try {
		const meData: MeUserBackendInterface | null = await validateRefreshToken();

		if (isProtectedRoute && !meData) {
			cookieStore.delete('accessToken');
			cookieStore.delete('refreshToken');
			return NextResponse.redirect(new URL('/login', req.nextUrl));
		}

		if (isPublicRoute && meData && meData.email && !req.nextUrl.pathname.startsWith('/dashboard')) {
			return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
		}

		const newUrl = new URL(req.url);

		if (meData) {
			Object.entries(meData).forEach(([key, value]: [string, any]): void => {
				if (typeof value === 'string' || typeof value === 'number') {
					newUrl.searchParams.set(key, value.toString());
				}
			});
		}

		return NextResponse.rewrite(newUrl);
	} catch (error) {
		return NextResponse.redirect(new URL('/login', req.nextUrl));
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon\\.ico).*)'],
};
