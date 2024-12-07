import { axiosPublic } from '@/config/axios.config';
import { RegisterAuthBackendInterface } from '@/interfaces/backend/auth/register.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const registerData: RegisterAuthBackendInterface = await request.json();

		console.log(registerData);

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: '/register',
			data: registerData,
		});

		return NextResponse.json({ message: 'Login successful' }, { status: 200 });
	} catch (error) {
		console.error('Login failed:', error);
		return NextResponse.json({ message: 'Unable to login', error }, { status: 500 });
	}
}
