import ResetPasswordRequestAuthInternalApiInterface from '@/interfaces/internal-api/auth/request/reset-password.request.auth.internal-api.interface';
import apiService from '@/services/api';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const { resetPasswordToken, ...data }: ResetPasswordRequestAuthInternalApiInterface = await request.json();

		await apiService.postResetPassword(resetPasswordToken, data);

		return NextResponse.json({ message: 'Password reset.' }, { status: 200 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to reset password.');
	}
}
