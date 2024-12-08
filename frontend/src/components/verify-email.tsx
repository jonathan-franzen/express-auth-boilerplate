'use client';

import { useRouter } from 'next/navigation';
import { ReactElement, useEffect, useState } from 'react';

export default function VerifyEmail({ verifyEmailToken }: { verifyEmailToken: string }): ReactElement | null {
	const router = useRouter();
	const [isError, setIsError] = useState(false);

	useEffect(() => {
		const handleLogout = async (): Promise<void> => {
			try {
				const response = await fetch('/api/verify-email', {
					method: 'POST',
					body: JSON.stringify({ verifyEmailToken }),
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error('Failed to logout');
				}

				console.log('Verified successful');
				router.push('/dashboard');
			} catch (error) {
				setIsError(true);
				console.error('Unable to verify', error);
			}
		};

		void handleLogout();
	}, []);

	if (isError) {
		return (
			<>
				<h1 className='text-center text-sm font-semibold text-gray-700'>ERROR VERIFYING EMAIL</h1>
				<div className='flex justify-center mt-4'>
					<a href='/login' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
						Back to login
					</a>
				</div>
			</>
		);
	}

	return null;
}
