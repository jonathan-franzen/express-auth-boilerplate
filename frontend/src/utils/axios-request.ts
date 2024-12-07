'use server';

import { setCookiesFromHeader } from '@/utils/set-cookies-from-header';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

export async function axiosRequest<T>(axiosInstance: AxiosInstance, config: AxiosRequestConfig, sendCookies?: boolean): Promise<T> {
	try {
		const cookieStore: ReadonlyRequestCookies = await cookies();

		if (sendCookies) {
			const headers = { Cookie: cookieStore.toString() };
			config = {
				...config,
				headers: {
					...config.headers,
					...headers,
				},
			};
		}

		const response: AxiosResponse<T> = await axiosInstance(config);

		const setCookieHeader: string[] | undefined = response.headers['set-cookie']
			? Array.isArray(response.headers['set-cookie'])
				? response.headers['set-cookie']
				: [response.headers['set-cookie']]
			: undefined;

		if (setCookieHeader) {
			try {
				await setCookiesFromHeader(setCookieHeader);
			} catch {}
		}

		return response.data;
	} catch (err: any) {
		if (axios.isAxiosError(err)) {
			throw err;
		}

		throw new Error('An unexpected error occurred.');
	}
}
