'use client';

import Button from '@/components/button';
import internalApiService from '@/services/internal-api';
import { useRouter } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function LogoutButton(): ReactElement {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleOnClick: () => Promise<void> = async (): Promise<void> => {
		setIsLoading(true);
		try {
			await internalApiService.deleteLogout();
			router.push('/login');
		} finally {
			router.push('/login');
			setIsLoading(false);
		}
	};

	return <Button label='SIGN OUT' onClick={handleOnClick} isLoading={isLoading} className='mt-6' />;
}
