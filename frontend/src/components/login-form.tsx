'use client';

import Form from '@/components/form';
import internalApiService from '@/services/internal-api';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function LoginForm(): ReactElement {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (formData: Record<string, string>) => {
		setIsLoading(true);
		try {
			const { email, password } = formData;
			await internalApiService.postLogin({ email, password });
			router.push('/dashboard');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Form
				fields={[
					{ name: 'email', type: 'email', placeholder: 'Email', autoComplete: 'email', required: true },
					{ name: 'password', type: 'password', placeholder: 'Password', autoComplete: 'current-password', required: true },
				]}
				submitLabel='SIGN IN'
				onSubmit={handleSubmit}
				isLoading={isLoading}
				additionalContent={
					<div className='mt-1 flex justify-end'>
						<a href='/reset-password' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
							Forgot your password?
						</a>
					</div>
				}
			/>
		</>
	);
}
