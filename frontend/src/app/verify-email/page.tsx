'use server';

import LogoutButton from '@/components/logout-button';
import ResendVerifyEmailButton from '@/components/resend-verify-email-button';
import cookieService from '@/services/cookie';
import { ReactElement } from 'react';

export default async function VerifyEmailPage(): Promise<ReactElement> {
	const me = await cookieService.getMeFromCookie();

	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>VERIFY YOUR EMAIL</h1>
			<div className='mt-6'>
				<p className='text-center'>Before you can access our services, you need to verify your email.</p>
			</div>
			<p className='mt-12 text-center text-sm font-semibold text-gray-700'>Have you not received the email?</p>
			<ResendVerifyEmailButton email={me.email} />
			<div className='mt-4 flex justify-center'>
				<LogoutButton />
			</div>
		</>
	);
}
