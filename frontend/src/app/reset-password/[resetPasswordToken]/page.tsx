import ResetPasswordForm from '@/components/reset-password-form';
import { Params } from 'next/dist/server/request/params';

export default async function ResetPasswordTokenPage(props: { params: Promise<Params> }) {
	const params = await props.params;
	const resetPasswordToken = Array.isArray(params.resetPasswordToken) ? params.resetPasswordToken[0] : params.resetPasswordToken;

	if (!resetPasswordToken) {
		return null;
	}

	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>SET YOUR NEW PASSWORD</h1>
			<ResetPasswordForm resetPasswordToken={resetPasswordToken} />
			<div className='flex justify-center mt-4'>
				<a href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Back to login
				</a>
			</div>
		</>
	);
}
