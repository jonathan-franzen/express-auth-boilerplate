import { axiosPublic } from '@/config/axios.config';
import { RegisterAuthBackendInterface } from '@/interfaces/backend/auth/register.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const registerData: RegisterAuthBackendInterface = await request.json();

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: '/register',
			data: registerData,
		});

		return NextResponse.json({ message: 'Registered successful' }, { status: 200 });
	} catch (error) {
		console.error('Registration failed:', error);
		return NextResponse.json({ message: 'Unable to register', error }, { status: 500 });
	}
}
