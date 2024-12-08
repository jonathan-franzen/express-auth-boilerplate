import { axiosPublic } from '@/config/axios.config';
import { SendResetPasswordEmailAuthBackendInterface } from '@/interfaces/backend/auth/send-reset-password-email.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const sendResetPasswordData: SendResetPasswordEmailAuthBackendInterface = await request.json();

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: '/reset-password',
			data: sendResetPasswordData,
		});

		return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
	} catch (error) {
		console.error('Email sending failed:', error);
		return NextResponse.json({ message: 'Unable to send email', error }, { status: 500 });
	}
}
