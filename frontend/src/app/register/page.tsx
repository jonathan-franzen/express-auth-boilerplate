import RegisterForm from '@/components/register-form';
import { ReactElement } from 'react';

export default function RegisterPage(): ReactElement {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>SIGN UP FOR SERVICE</h1>
			<RegisterForm />
			<h3 className='text-center text-xs text-gray-700 mt-4'>Already have an account?</h3>
			<div className='flex justify-center'>
				<a href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Sign in
				</a>
			</div>
		</>
	);
}
