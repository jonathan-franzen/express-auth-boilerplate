import RegisterRequestAuthApiInterface from '@/interfaces/api/auth/request/register.request.auth.api.interface';
import apiService from '@/services/api';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const registerData: RegisterRequestAuthApiInterface = await request.json();

		await apiService.postRegister(registerData);

		return NextResponse.json({ message: 'Registered.' }, { status: 201 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to register.');
	}
}
