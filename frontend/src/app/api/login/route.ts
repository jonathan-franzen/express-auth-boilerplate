import { axiosPublic } from '@/config/axios.config';
import { CredentialsAuthInterface } from '@/interfaces/auth/credentials.auth.interface';
import { LoginAuthBackendInterface } from '@/interfaces/backend/auth/login.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const credentials: CredentialsAuthInterface = await request.json();

		const { accessToken } = await axiosRequest<LoginAuthBackendInterface>(axiosPublic, {
			method: 'POST',
			url: '/login',
			data: credentials,
			withCredentials: true,
		});

		if (accessToken) {
			const cookieStore: ReadonlyRequestCookies = await cookies();
			cookieStore.set('accessToken', accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60, // 1 hour
			});
		} else {
			throw new Error('Failed to retrieve access token.');
		}

		return NextResponse.json({ message: 'Login successful' }, { status: 200 });
	} catch (error) {
		console.error('Login failed:', error);
		return NextResponse.json({ message: 'Unable to login', error }, { status: 500 });
	}
}
