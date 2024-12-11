import apiService from '@/services/api';
import apiRouteErrorHandler from '@/utils/api-route-error-handler';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const { verifyEmailToken }: { verifyEmailToken: string } = await request.json();

		await apiService.postVerifyEmail(verifyEmailToken);
		return NextResponse.json({ message: 'Email verified.' }, { status: 200 });
	} catch (err) {
		return apiRouteErrorHandler(err, 'Unable to verify email.');
	}
}
