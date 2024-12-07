'use client';

import LoadingSpinner from '@/components/loading-spinner';
import { redirect } from 'next/navigation';
import { ReactElement, useState } from 'react';

export default function LogoutButton(): ReactElement {
	const [isFetching, setIsFetching] = useState(false);

	const handleOnSubmit: () => Promise<void> = async (): Promise<void> => {
		setIsFetching(true);
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
		} catch (error) {
			console.error('Unable to logout', error);
		} finally {
			redirect('/login');
		}
	};

	return (
		<button
			onClick={handleOnSubmit}
			className='min-h-10.5 text-center justify-center mt-6 inline-flex items-center gap-2 w-full rounded-md bg-gray-700 px-3 text-xs font-semibold text-white shadow-inner disabled:cursor-not-allowed focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1'
		>
			{isFetching ? <LoadingSpinner size='md' /> : 'SIGN OUT'}
		</button>
	);
}
