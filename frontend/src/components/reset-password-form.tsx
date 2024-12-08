'use client';

import Form from '@/components/form';
import { ReactElement, useState } from 'react';

export default function ResetPasswordForm({ resetPasswordToken }: { resetPasswordToken: string }): ReactElement {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (formData: Record<string, string>) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/reset-password', {
				method: 'POST',
				body: JSON.stringify({ ...formData, resetPasswordToken }),
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error('Failed to reset password');
			}
		} catch (error: any) {
			console.error('Unable to reset password', error);
			throw new Error(error.message || 'Something went wrong.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form
			fields={[{ name: 'password', type: 'password', placeholder: 'New password', autoComplete: 'current-password', required: true }]}
			submitLabel='UPDATE PASSWORD'
			onSubmit={handleSubmit}
			isLoading={isLoading}
		/>
	);
}
