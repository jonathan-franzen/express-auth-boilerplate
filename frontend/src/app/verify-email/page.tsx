'use server';

import { ReactElement } from 'react';
import ResendVerifyEmailButton from '@/components/resend-verify-email-button';
import LogoutButton from '@/components/logout-button';
import { validateMe } from '@/utils/validate-me';
import { SearchParams } from 'next/dist/server/request/search-params';

export default async function VerifyEmailPage(props: { searchParams: Promise<SearchParams> }): Promise<ReactElement> {
	const searchParams = await props.searchParams;
	const me = await validateMe(searchParams, true);

	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>VERIFY YOUR EMAIL</h1>
			<div className='mt-6'>
				<p className='text-center'>
					Before you can access our services, you need to verify your email.
				</p>
			</div>
			<p className='text-center text-sm font-semibold text-gray-700 mt-12'>Have you not received the email?</p>
			<ResendVerifyEmailButton email={me.email}/>
			<div className='flex justify-center mt-4'>
				<LogoutButton/>
			</div>
		</>
	);
}
