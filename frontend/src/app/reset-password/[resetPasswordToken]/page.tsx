import ResetPasswordForm from '@/components/reset-password-form';
import StatusError from '@/errors/status.error';
import apiService from '@/services/api';
import { AxiosError } from 'axios';
import { Params } from 'next/dist/server/request/params';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ResetPasswordTokenPage(props: { params: Promise<Params> }) {
	const params = await props.params;
	const resetPasswordToken = Array.isArray(params.resetPasswordToken) ? params.resetPasswordToken[0] : params.resetPasswordToken;

	if (!resetPasswordToken) {
		throw new StatusError('Something unexpected happened.', 500);
	}

	try {
		await apiService.getVerifyResetPasswordToken(resetPasswordToken);
	} catch (err) {
		if (err instanceof AxiosError && err.status === 410) {
			return <RenderExpired />;
		}
		return notFound();
	}

	return <RenderSuccess resetPasswordToken={resetPasswordToken} />;
}

function RenderExpired() {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>TOKEN EXPIRED</h1>
			<p>Your token has expired. Please request a new one.</p>
			<div className='mt-4 flex justify-center'>
				<Link href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Back to login
				</Link>
			</div>
		</>
	);
}

function RenderSuccess({ resetPasswordToken }: { resetPasswordToken: string }) {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>SET YOUR NEW PASSWORD</h1>
			<ResetPasswordForm resetPasswordToken={resetPasswordToken} />
			<div className='mt-4 flex justify-center'>
				<Link href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Back to login
				</Link>
			</div>
		</>
	);
}
