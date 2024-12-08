'use client';

import Form from '@/components/form';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function RegisterForm(): ReactElement {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (formData: Record<string, string>) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error('Failed to register');
			}
			router.push('/login');
		} catch (error: any) {
			console.error('Unable to register', error);
			throw new Error(error.message || 'Something went wrong.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Form
				fields={[
					{ name: 'email', type: 'email', placeholder: 'Email', autoComplete: 'email', required: true },
					{ name: 'firstName', type: 'firstName', placeholder: 'First name', autoComplete: 'firstName', required: true },
					{ name: 'lastName', type: 'lastName', placeholder: 'Last name', autoComplete: 'lastName', required: true },
					{ name: 'password', type: 'password', placeholder: 'Password', autoComplete: 'new-password', required: true },
				]}
				submitLabel='SIGN UP'
				onSubmit={handleSubmit}
				isLoading={isLoading}
			/>
		</>
	);
}
