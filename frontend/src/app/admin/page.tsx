'use server';

import UserResponseUsersApiInterface from '@/interfaces/api/users/response/user.response.users.api.interface';
import apiService from '@/services/api';
import Link from 'next/link';

export default async function AdminPage() {
	const users: UserResponseUsersApiInterface[] = await apiService.getUsers();

	return (
		<div className='flex h-full flex-col justify-between'>
			<div>
				<h1 className='text-center text-sm font-semibold text-gray-700'>PROTECTED ADMIN PAGE</h1>
				<h3 className='mt-12 text-center'>USERS</h3>
				<div className='mt-2 flex flex-col gap-2 overflow-y-scroll'>
					{users.map((user, index) => (
						<div key={user.id}>
							<p>
								{index + 1}. {user.id}
							</p>
							<p>First name: {user.firstName}</p>
							<p>Last name: {user.lastName}</p>
							<p>Email: {user.email}</p>
							<p>Email verified at: {user.emailVerifiedAt}</p>
							<p>User created at: {user.createdAt}</p>
							<p>User updated at: {user.updatedAt}</p>
						</div>
					))}
				</div>
			</div>
			<div className='mt-2 flex justify-center'>
				<Link href='/dashboard' className='w-fit text-xs text-pink-900 hover:text-pink-700'>
					Back to dashboard
				</Link>
			</div>
		</div>
	);
}
