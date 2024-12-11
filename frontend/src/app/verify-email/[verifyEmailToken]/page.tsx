import VerifyEmail from '@/components/verify-email';
import { Params } from 'next/dist/server/request/params';

export default async function VerifyEmailTokenPage(props: { params: Promise<Params> }) {
	const params = await props.params;
	const verifyEmailToken = Array.isArray(params.verifyEmailToken) ? params.verifyEmailToken[0] : params.verifyEmailToken;

	if (!verifyEmailToken) {
		return null;
	}

	return <VerifyEmail verifyEmailToken={verifyEmailToken} />;
}
