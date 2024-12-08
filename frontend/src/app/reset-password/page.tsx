import SendResetPasswordEmailForm from '@/components/send-reset-password-email-form';
import { ReactElement } from 'react';

export default function ResetPasswordPage(): ReactElement {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>RESET YOUR PASSWORD</h1>
			<SendResetPasswordEmailForm />
			<div className='flex justify-center mt-4'>
				<a href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Go back
				</a>
			</div>
		</>
	);
}
