'use client';

import Form from '@/components/form';
import ResetPasswordRequestAuthApiInterface from '@/interfaces/api/auth/request/reset-password.request.auth.api.interface';
import internalApiService from '@/services/internal-api';
import { ReactElement, useState } from 'react';

export default function ResetPasswordForm({ resetPasswordToken }: { resetPasswordToken: string }): ReactElement {
	const [isLoading, setIsLoading] = useState(false);

	const handleOnSubmit = async (formData: Record<string, any>) => {
		setIsLoading(true);
		try {
			await internalApiService.postResetPassword({ ...(formData as ResetPasswordRequestAuthApiInterface), resetPasswordToken });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form
			fields={[{ name: 'password', type: 'password', placeholder: 'New password', autoComplete: 'current-password', required: true }]}
			submitLabel='UPDATE PASSWORD'
			onSubmit={handleOnSubmit}
			isLoading={isLoading}
		/>
	);
}
