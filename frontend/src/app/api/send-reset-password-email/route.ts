import SendResetPasswordEmailRequestAuthApiInterface from '@/interfaces/api/auth/request/send-reset-password-email.request.auth.api.interface';
import apiService from '@/services/api';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const sendResetPasswordData: SendResetPasswordEmailRequestAuthApiInterface = await request.json();

		await apiService.postSendResetPasswordEmail(sendResetPasswordData);

		return NextResponse.json({ message: 'Email sent.' }, { status: 202 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to send email.');
	}
}
