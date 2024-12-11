import LoginRequestAuthApiInterface from '@/interfaces/api/auth/request/login.request.auth.api.interface';
import apiService from '@/services/api';
import cookieService from '@/services/cookie';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const credentials: LoginRequestAuthApiInterface = await request.json();

		const { accessToken } = await apiService.postLogin(credentials);

		await cookieService.setCookie('accessToken', accessToken);

		return NextResponse.json({ message: 'Login successful.' }, { status: 201 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to login.');
	}
}
