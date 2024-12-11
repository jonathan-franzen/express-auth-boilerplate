'use client';

import Button from '@/components/button';
import { ReactElement, useState } from 'react';

export default function ResendVerifyEmailButton({ email }: { email: string }): ReactElement {
	const [isLoading, setIsLoading] = useState(false);

	const handleOnClick: () => Promise<void> = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/resend-verify-email', {
				method: 'POST',
				body: JSON.stringify({ email }),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to resend email');
			}

			console.log('Resent email successful');
		} catch (error) {
			console.error('Unable to resend email', error);
		} finally {
			setIsLoading(false);
		}
	};

	return <Button label='RESEND VERIFY EMAIL' isLoading={isLoading} className='mt-6' onClick={handleOnClick} />;
}
