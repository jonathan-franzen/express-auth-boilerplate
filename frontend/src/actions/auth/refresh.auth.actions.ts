'use server';

import { axiosPublic } from '@/config/axios.config';
import { RefreshAuthBackendInterface } from '@/interfaces/backend/auth/refresh.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

export async function postRefreshAuthAction(): Promise<string | null> {
	try {
		const cookieStore: ReadonlyRequestCookies = await cookies();
		const { accessToken } = await axiosRequest<RefreshAuthBackendInterface>(
			axiosPublic,
			{
				method: 'POST',
				url: '/refresh',
				withCredentials: true,
			},
			true,
		);

		if (accessToken) {
			cookieStore.set('accessToken', accessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/',
				maxAge: 60 * 60, // 1 hour
			});

			return accessToken;
		}
		return null;
	} catch {
		return null;
	}
}
