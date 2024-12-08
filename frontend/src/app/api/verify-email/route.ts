import { axiosPublic } from '@/config/axios.config';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const verifyEmailData: { verifyEmailToken: string }  = await request.json();

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: `/verify-email/${verifyEmailData.verifyEmailToken}`,
		});

		return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
	} catch (error) {
		console.error('Email verification failed:', error);
		return NextResponse.json({ message: 'Unable to verify email', error }, { status: 500 });
	}
}
