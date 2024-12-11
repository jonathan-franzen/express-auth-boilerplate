import StatusError from '@/errors/status.error';
import LoginRequestAuthApiInterface from '@/interfaces/api/auth/request/login.request.auth.api.interface';
import RegisterRequestAuthApiInterface from '@/interfaces/api/auth/request/register.request.auth.api.interface';
import ResendVerifyEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/resend-verify-email.request.auth.api.interface';
import ResetPasswordRequestAuthApiInterface from '@/interfaces/api/auth/request/reset-password.request.auth.api.interface';
import SendResetPasswordEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/send-reset-password-email.request.auth.api.interface';
import LoginResponseAuthApiInterface from '@/interfaces/api/auth/response/login.response.auth.api.interface';
import RefreshResponseAuthApiInterface from '@/interfaces/api/auth/response/refresh.response.auth.api.interface';
import MeResponseUsersApiInterface from '@/interfaces/api/users/response/me.response.users.api.interface';
import UserResponseUsersApiInterface from '@/interfaces/api/users/response/user.response.users.api.interface';
import CookieService from '@/services/cookie/cookie.service';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export default class ApiService {
	constructor(
		private readonly axiosExternalInstance: AxiosInstance,
		private readonly cookieService: CookieService,
	) {}

	private async axiosRequest<T>(config: AxiosRequestConfig, setCookies: boolean = false, res?: NextResponse): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosExternalInstance(config);

			if (setCookies) {
				const setCookieHeader: string[] | null = response.headers['set-cookie']
					? Array.isArray(response.headers['set-cookie'])
						? response.headers['set-cookie']
						: [response.headers['set-cookie']]
					: null;

				if (setCookieHeader) {
					await this.cookieService.setCookiesFromHeader(setCookieHeader, res);
				}
			}

			return response.data;
		} catch (err: any) {
			if (isAxiosError(err)) {
				throw err;
			}

			throw new StatusError('An unexpected error occurred.', 500);
		}
	}

	private async authenticatedApiRequest<T>(config: AxiosRequestConfig<any>): Promise<T> {
		const accessToken: string | null = await this.cookieService.getCookie('accessToken');

		if (!accessToken) {
			await this.cookieService.deleteAuthCookies();
			redirect('/login');
		}

		const headers = {
			['Authorization']: `Bearer ${accessToken}`,
		};

		config = {
			...config,
			headers: {
				...config.headers,
				...headers,
			},
		};

		return await this.axiosRequest<T>(config);
	}

	async postRegister(data: RegisterRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/register',
			data,
		};

		return await this.axiosRequest<void>(config);
	}

	async postVerifyEmail(verifyEmailToken: string) {
		const config = {
			method: 'POST',
			url: `/verify-email/${verifyEmailToken}`,
		};

		return await this.axiosRequest<void>(config);
	}

	async postResendVerifyEmail(data: ResendVerifyEmailRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/resend-verify-email',
			data,
		};

		return await this.axiosRequest<void>(config);
	}

	async postLogin(data: LoginRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/login',
			data,
			withCredentials: true,
		};

		return await this.axiosRequest<LoginResponseAuthApiInterface>(config, true);
	}

	async postRefresh(res: NextResponse) {
		const config = {
			method: 'POST',
			url: '/refresh',
			headers: { Cookie: await this.cookieService.getCookieStore() },
			withCredentials: true,
		};

		return await this.axiosRequest<RefreshResponseAuthApiInterface>(config, true, res);
	}

	async postSendResetPasswordEmail(data: SendResetPasswordEmailRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/reset-password',
			data,
		};

		return await this.axiosRequest<void>(config);
	}

	async postResetPassword(resetPasswordToken: string, data: ResetPasswordRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: `/reset-password/${resetPasswordToken}`,
			data,
		};

		return await this.axiosRequest<void>(config);
	}

	async deleteLogout() {
		const config = {
			method: 'DELETE',
			url: '/logout',
			headers: { Cookie: await this.cookieService.getCookieStore() },
			withCredentials: true,
		};

		return await this.axiosRequest<RefreshResponseAuthApiInterface>(config);
	}

	// /users start here

	async getUsers() {
		const config = { url: '/users', method: 'GET' };

		return await this.authenticatedApiRequest<UserResponseUsersApiInterface[]>(config);
	}

	async getMeUsers(accessToken: string) {
		const config = {
			url: '/users/me',
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};

		return await this.axiosRequest<MeResponseUsersApiInterface>(config);
	}
}
