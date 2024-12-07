'use server';

import { postRefreshAuthAction } from '@/actions/auth/refresh.auth.actions';
import { axiosPublic } from '@/config/axios.config';
import { axiosRequest } from '@/utils/axios-request';
import { AxiosError } from 'axios';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

export async function validateRefreshToken<T>(): Promise<T | null> {
	const cookieStore: ReadonlyRequestCookies = await cookies();
	const accessToken: string | undefined = cookieStore.get('accessToken')?.value;

	const config = {
		url: '/users/me',
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		withCredentials: true,
	};

	try {
		return await axiosRequest<T>(axiosPublic, config);
	} catch (error: AxiosError | any) {
		if (error?.response?.status === 401) {
			const newAccessToken: string | null = await postRefreshAuthAction();

			if (newAccessToken) {
				config.headers['Authorization'] = `Bearer ${newAccessToken}`;
				return await axiosRequest<T>(axiosPublic, config);
			}
		}
		return null;
	}
}
