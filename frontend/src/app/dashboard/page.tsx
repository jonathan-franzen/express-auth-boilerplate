'use server';

import LogoutButton from '@/components/logout-button';
import { validateMe } from '@/utils/validate-me';
import { SearchParams } from 'next/dist/server/request/search-params';
import { ReactElement } from 'react';

export default async function DashboardPage(props: { searchParams: Promise<SearchParams> }): Promise<ReactElement> {
	const searchParams = await props.searchParams;
	const me = await validateMe(searchParams);

	return (
		<>
			<h1>
				Authenticated: {me.firstName} {me.lastName} with {me.email}, verified at {me.emailVerifiedAt}
			</h1>
			<LogoutButton />
		</>
	);
}
