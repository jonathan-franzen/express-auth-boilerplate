'use server';

import LogoutButton from '@/components/logout-button';
import { validateMe } from '@/utils/validate-me';
import { SearchParams } from 'next/dist/server/request/search-params';

export default async function UsersPage(props: { searchParams: Promise<SearchParams> }) {
	const searchParams = await props.searchParams;
	const me = await validateMe(searchParams);

	return (
		<>
			<h1>Viewing users as {me.email}</h1>
			<LogoutButton />
		</>
	);
}
