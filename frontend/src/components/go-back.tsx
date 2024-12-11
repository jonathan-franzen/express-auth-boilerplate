'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default function GoBack({
	className,
	children,
}: PropsWithChildren<{
	className?: string;
}>) {
	const router = useRouter();
	return (
		<button className={className} onClick={() => router.back()}>
			{children}
		</button>
	);
}
