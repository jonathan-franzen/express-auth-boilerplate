import { ADMIN_ROUTES, PUBLIC_ROUTES } from '@/constants/routes.constants';
import MeResponseUsersApiInterface from '@/interfaces/api/users/response/me.response.users.api.interface';
import cookieService from '@/services/cookie';
import validationService from '@/services/validation';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

function redirectTo(url: string, req: NextRequest) {
	return NextResponse.redirect(new URL(url, req.nextUrl));
}

export default async function middleware(req: NextRequest): Promise<NextResponse> {
	const path: string = req.nextUrl.pathname;
	const refreshToken: boolean = await cookieService.hasCookie('refreshToken');

	const isRouteMatch = (routes: string[]): boolean => routes.some((route) => route.startsWith(path));
	const isPublicRoute: boolean = isRouteMatch(PUBLIC_ROUTES);
	const isAdminRoute: boolean = isRouteMatch(ADMIN_ROUTES);

	if (!refreshToken) {
		return isPublicRoute && path !== '/' ? NextResponse.next() : redirectTo('/login', req);
	}

	const res = NextResponse.next();

	const meData: MeResponseUsersApiInterface | null = await validationService.validateAndGetMe(res);

	if (!meData || !meData.id || !meData.email || meData.roles.length < 1 || !meData.firstName || !meData.lastName) {
		await cookieService.deleteAuthCookies();
		return isPublicRoute ? NextResponse.next() : redirectTo('/login', req);
	}

	if (path === '/') {
		return redirectTo('/dashboard', req);
	}

	if (isPublicRoute && !req.nextUrl.pathname.startsWith('/dashboard')) {
		return redirectTo('/dashboard', req);
	}

	if (isAdminRoute && !meData.roles.includes('ADMIN')) {
		return redirectTo('/unauthorized', req);
	}

	if (!meData.emailVerifiedAt && !req.nextUrl.pathname.startsWith('/verify-email')) {
		redirect('/verify-email');
	}

	await cookieService.setCookie('meData', JSON.stringify(meData), 'session', '/', res);

	return res;
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon\\.ico).*)'],
};
