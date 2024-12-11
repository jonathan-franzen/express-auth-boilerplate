import ResendVerifyEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/resend-verify-email.request.auth.api.interface';
import apiService from '@/services/api';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const resendVerifyEmailData: ResendVerifyEmailRequestAuthApiInterface = await request.json();

		await apiService.postResendVerifyEmail(resendVerifyEmailData);

		return NextResponse.json({ message: 'Email sent.' }, { status: 202 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to send email.');
	}
}
