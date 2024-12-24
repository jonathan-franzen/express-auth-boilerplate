interface SendEmailOptionsMailerInterface {
	to: string;
	subject: string;
	templateName: string;
	context: Record<string, any>;
}

export default SendEmailOptionsMailerInterface;
