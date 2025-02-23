import { Role } from '@prisma/client';

export interface getUsersPrismaInterface {
	filters?: Record<string, string>;
	limit?: number;
	page?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface UserPrismaInterface {
	createdAt: Date;
	email: string;
	emailVerifiedAt: Date | null;
	firstName: string;
	id: string;
	lastName: string;
	roles: Role[];
	updatedAt: Date;
}

export interface UserPrismaWithFunctionsInterface extends UserPrismaInterface {
	validatePassword: (rawPassword: string) => Promise<boolean>;
}
