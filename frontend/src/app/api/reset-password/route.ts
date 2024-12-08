import { axiosPublic } from '@/config/axios.config';
import { ResetPasswordAuthBackendInterface } from '@/interfaces/backend/auth/reset-password.auth.backend.interface';
import { axiosRequest } from '@/utils/axios-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const resetPasswordData: ResetPasswordAuthBackendInterface & { resetPasswordToken: string } = await request.json();

		await axiosRequest<void>(axiosPublic, {
			method: 'POST',
			url: `/reset-password/${resetPasswordData.resetPasswordToken}`,
			data: { password: resetPasswordData.password },
		});

		return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
	} catch (error) {
		console.error('Password reset failed:', error);
		return NextResponse.json({ message: 'Unable to reset password', error }, { status: 500 });
	}
}
