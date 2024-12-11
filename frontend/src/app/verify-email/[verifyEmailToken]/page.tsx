import VerifyEmail from '@/components/verify-email';
import cookieService from '@/services/cookie';
import { Params } from 'next/dist/server/request/params';

export default async function VerifyEmailTokenPage(props: { params: Promise<Params> }) {
	const meDataExists = await cookieService.hasCookie('meData');
	const params = await props.params;
	const verifyEmailToken = Array.isArray(params.verifyEmailToken) ? params.verifyEmailToken[0] : params.verifyEmailToken;

	if (!verifyEmailToken) {
		return null;
	}

	return <VerifyEmail verifyEmailToken={verifyEmailToken} isAuthenticated={meDataExists} />;
}
