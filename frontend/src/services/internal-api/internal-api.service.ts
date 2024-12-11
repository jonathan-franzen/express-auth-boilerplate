import StatusError from '@/errors/status.error';
import LoginRequestAuthApiInterface from '@/interfaces/api/auth/request/login.request.auth.api.interface';
import LoginResponseAuthApiInterface from '@/interfaces/api/auth/response/login.response.auth.api.interface';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';

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

	async postLogin(data: LoginRequestAuthApiInterface) {
		const config = {
			method: 'POST',
			url: '/api/login',
			data,
			withCredentials: true,
		};

		return await this.axiosInternalRequest<LoginResponseAuthApiInterface>(config);
	}
}
