import MeResponseUsersApiInterface from '@/interfaces/api/users/response/me.response.users.api.interface';
import apiService from '@/services/api';
import CookieService from '@/services/cookie/cookie.service';
import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

export default class ValidationService {
	constructor(private readonly cookieService: CookieService) {}

	private async refreshTokenAndGetUser(res: NextResponse): Promise<MeResponseUsersApiInterface | null> {
		const { accessToken } = await apiService.postRefresh(res);

		if (!accessToken) {
			return null;
		}

		await this.cookieService.setCookie('accessToken', accessToken, 60 * 60 * 1000, '/', res);

		return await apiService.getMeUsers(accessToken);
	}

	async validateAndGetMe(res: NextResponse): Promise<MeResponseUsersApiInterface | null> {
		const accessToken = await this.cookieService.getCookie('accessToken');

		try {
			if (accessToken) {
				return await apiService.getMeUsers(accessToken);
			}
			return await this.refreshTokenAndGetUser(res);
		} catch (error) {
			if ((error as AxiosError)?.response?.status === 401) {
				return await this.refreshTokenAndGetUser(res);
			}
			return null;
		}
	}
}
