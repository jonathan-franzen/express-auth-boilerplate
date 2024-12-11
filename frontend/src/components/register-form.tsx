'use client';

import Form from '@/components/form';
import RegisterRequestAuthApiInterface from '@/interfaces/api/auth/request/register.request.auth.api.interface';
import internalApiService from '@/services/internal-api';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function RegisterForm(): ReactElement {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleOnSubmit = async (formData: Record<string, any>) => {
		setIsLoading(true);
		const { email, password } = formData;

		try {
			await internalApiService.postRegister(formData as RegisterRequestAuthApiInterface);
			await internalApiService.postLogin({ email, password });
			router.push('/verify-email');
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
				onSubmit={handleOnSubmit}
				isLoading={isLoading}
			/>
		</>
	);
}
