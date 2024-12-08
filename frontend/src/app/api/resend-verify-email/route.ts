import { axiosPublic } from '@/config/axios.config';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';
import {
	ResendVerifyEmailAuthBackendInterface
} from '@/interfaces/backend/auth/resend-verify-email.auth.backend.interface';

export async function POST(request: Request) {
	try {
		const resendVerifyEmailData: ResendVerifyEmailAuthBackendInterface = await request.json();

		console.log(resendVerifyEmailData, 'resendVerifyEmailData');

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: '/resend-verify-email',
			data: {email: resendVerifyEmailData},
		});

		return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
	} catch (error) {
		console.error('Email sending failed:', error);
		return NextResponse.json({ message: 'Unable to send email', error }, { status: 500 });
	}
}
