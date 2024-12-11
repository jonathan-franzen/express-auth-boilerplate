export default interface MeResponseUsersApiInterface {
	id: string;
	email: string;
	roles: string[];
	firstName: string;
	lastName: string;
	emailVerifiedAt: string | null;
}
