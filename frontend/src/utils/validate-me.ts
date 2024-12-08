'use server';

import { MeUserBackendInterface } from '@/interfaces/backend/user/me.user.backend.interface';
import { SearchParams } from 'next/dist/server/request/search-params';
import { redirect } from 'next/navigation';

export async function validateMe(searchParams: SearchParams, isVerifyUrl: boolean=false): Promise<MeUserBackendInterface> {
	const id = Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id;
	const email = Array.isArray(searchParams.email) ? searchParams.email[0] : searchParams.email;
	const firstName = Array.isArray(searchParams.firstName) ? searchParams.firstName[0] : searchParams.firstName;
	const lastName = Array.isArray(searchParams.lastName) ? searchParams.lastName[0] : searchParams.lastName;

	if (!id || !email || !firstName || !lastName) {
		redirect('/login');
	}

	const emailVerifiedAt = Array.isArray(searchParams.emailVerifiedAt) ? searchParams.emailVerifiedAt[0] : searchParams.emailVerifiedAt;

	if (!emailVerifiedAt && !isVerifyUrl) {
		redirect('/verify-email');
	}

	return {
		id: id || '',
		email: email || '',
		firstName: firstName || '',
		lastName: lastName || '',
		emailVerifiedAt: emailVerifiedAt || null,
	};
}
