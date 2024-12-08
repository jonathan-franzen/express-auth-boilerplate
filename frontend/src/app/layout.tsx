import type { Metadata } from 'next';
import './globals.css';
import { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
	title: 'Express Auth Boilerplate',
	description: 'Frontend DEMO to showcase Express Auth Boilerplate',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>): ReactElement {
	return (
		<html lang='en'>
			<body>
				<main className='flex flex-col gap-8 row-start-2 items-center h-screen justify-center'>
					<div className='px-8 w-96 flex flex-col py-16 border border-black min-h-[600px]'>{children}</div>
				</main>
			</body>
		</html>
	);
}
