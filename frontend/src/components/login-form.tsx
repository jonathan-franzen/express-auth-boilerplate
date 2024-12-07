'use client';

import Form from '@/components/form';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function LoginForm(): ReactElement {
	const [isFetching, setIsFetching] = useState(false);
	const router = useRouter();

	const handleSubmit = async (formData: Record<string, string>) => {
		setIsFetching(true);
		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error('Failed to login');
			}
			router.push('/dashboard');
		} catch (error: any) {
			console.error('Unable to login', error);
			throw new Error(error.message || 'Something went wrong.');
		} finally {
			setIsFetching(false);
		}
	};

	return (
		<Form
			fields={[
				{ name: 'email', type: 'email', placeholder: 'Email', autoComplete: 'email', required: true },
				{ name: 'password', type: 'password', placeholder: 'Password', autoComplete: 'current-password', required: true },
			]}
			submitLabel='SIGN IN'
			onSubmit={handleSubmit}
			isFetching={isFetching}
			additionalContent={
				<div className='flex justify-end mt-1'>
					<a href='/forgot-password' className='w-fit text-xs hover:text-pink-700 text-pink-900'>
						Forgot your password?
					</a>
				</div>
			}
		/>
	);
}
