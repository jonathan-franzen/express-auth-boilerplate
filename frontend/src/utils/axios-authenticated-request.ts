'use server';

import { axiosPrivate } from '@/config/axios.config';
import { axiosRequest } from '@/utils/axios-request';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function axiosAuthenticatedRequest<T>(config: AxiosRequestConfig<any>): Promise<T> {
	const cookieStore: ReadonlyRequestCookies = await cookies();
	const accessToken: string | undefined = cookieStore.get('accessToken')?.value;

	const headers = {
		['Authorization']: `Bearer ${accessToken}`,
	};

	config = {
		...config,
		headers: headers,
	};

	try {
		return await axiosRequest<T>(axiosPrivate, config);
	} catch (error: AxiosError | any) {
		redirect('/login');
	}
}
