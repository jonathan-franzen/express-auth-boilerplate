import StatusError from '@/errors/status.error';
import LoginRequestAuthApiInterface from '@/interfaces/api/auth/request/login.request.auth.api.interface';
import RegisterRequestAuthApiInterface from '@/interfaces/api/auth/request/register.request.auth.api.interface';
import ResendVerifyEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/resend-verify-email.request.auth.api.interface';
import SendResetPasswordEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/send-reset-password-email.request.auth.api.interface';
import ResetPasswordRequestAuthInternalApiInterface from '@/interfaces/internal-api/auth/request/reset-password.request.auth.internal-api.interface';
import VerifyEmailRequestAuthInternalApiInterface from '@/interfaces/internal-api/auth/request/verify-email.request.auth.internal-api.interface';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { NextResponse } from 'next/server';

export default class InternalApiService {
	constructor(private readonly axiosInternalInstance: AxiosInstance) {}

	private async axiosInternalRequest<T>(config: AxiosRequestConfig): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInternalInstance(config);

			return response.data;
		} catch (err: any) {
			if (isAxiosError(err)) {
				throw err;
			}

			throw new StatusError('An unexpected error occurred.', 500);
		}
	}

	async postRegister(data: RegisterRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/register',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async postLogin(data: LoginRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/login',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async postVerifyEmail(data: VerifyEmailRequestAuthInternalApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/verify-email',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async postResendVerifyEmail(data: ResendVerifyEmailRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/resend-verify-email',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async postResetPassword(data: ResetPasswordRequestAuthInternalApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/reset-password',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async postSendResetPasswordEmail(data: SendResetPasswordEmailRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/send-reset-password-email',
			data,
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}

	async deleteLogout() {
		const config = {
			method: 'DELETE',
			url: '/api/logout',
		};

		return await this.axiosInternalRequest<NextResponse>(config);
	}
}
