'use client';

import { ReactElement } from 'react';

export default function HomeError(): ReactElement {
	return (
		<>
			<h1 className='text-center text-sm font-semibold text-gray-700'>ERROR PAGE</h1>
			<h3 className='mt-12 text-center'>Something unexpected happened.</h3>
		</>
	);
}
