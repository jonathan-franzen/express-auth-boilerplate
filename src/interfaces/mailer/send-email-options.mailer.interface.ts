interface SendEmailOptionsMailerInterface {
	context: Record<string, string>;
	subject: string;
	templateName: string;
	to: string;
}

export default SendEmailOptionsMailerInterface;
