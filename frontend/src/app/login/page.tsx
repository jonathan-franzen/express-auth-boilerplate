import LoginForm from '@/components/login-form';
import { ReactElement } from 'react';

export default function LoginPage(): ReactElement {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>SIGN INTO YOUR ACCOUNT</h1>
			<LoginForm />
			<h3 className='text-center text-xs text-gray-700 mt-4'>Don't have an account?</h3>
			<div className='flex justify-center'>
				<a href='/register' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Sign up
				</a>
			</div>
		</>
	);
}
