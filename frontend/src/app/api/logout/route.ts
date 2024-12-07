import { axiosPublic } from '@/config/axios.config';
import { axiosRequest } from '@/utils/axios-request';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE() {
	try {
		const cookieStore: ReadonlyRequestCookies = await cookies();

		await axiosRequest<void>(
			axiosPublic,
			{
				method: 'DELETE',
				url: '/logout',
				withCredentials: true,
			},
			true,
		);

		cookieStore.delete('accessToken');
		cookieStore.delete('refreshToken');

		return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
	} catch (error) {
		console.error('Logout failed:', error);
		return NextResponse.json({ message: 'Unable to logout', error }, { status: 500 });
	}
}
