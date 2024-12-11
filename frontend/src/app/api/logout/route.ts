import apiService from '@/services/api';
import cookieService from '@/services/cookie';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function DELETE() {
	try {
		await apiService.deleteLogout();

		await cookieService.deleteAuthCookies();

		return NextResponse.json({ message: 'Logout successful.' }, { status: 200 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to logout.');
	}
}
