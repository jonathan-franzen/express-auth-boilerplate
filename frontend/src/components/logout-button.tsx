'use client';

import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function LogoutButton(): ReactElement {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleOnClick: () => Promise<void> = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/logout', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to logout');
			}

			console.log('Logout successful');

			router.push('/login');
		} catch (error) {
			console.error('Unable to logout', error);
		} finally {
			setIsLoading(false);
		}
	};

	return <Button label='SIGN OUT' onClick={handleOnClick} isLoading={isLoading} className='mt-6' />;
}
