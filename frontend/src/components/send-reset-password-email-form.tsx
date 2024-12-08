'use client';

import Form from '@/components/form';
import { ReactElement, useState } from 'react';

export default function SendResetPasswordEmailForm(): ReactElement {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (formData: Record<string, string>) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/send-reset-password-email', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error('Failed to send reset password email');
			}
		} catch (error: any) {
			console.error('Unable to send reset password email', error);
			throw new Error(error.message || 'Something went wrong.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Form
				fields={[{ name: 'email', type: 'email', placeholder: 'Email', autoComplete: 'email', required: true }]}
				submitLabel='SEND PASSWORD RESET EMAIL'
				onSubmit={handleSubmit}
				isLoading={isLoading}
			/>
		</>
	);
}
