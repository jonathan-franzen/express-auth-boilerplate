export interface SendEmailOptionsEmailInterface {
	to: string;
	subject: string;
	templateName: string;
	context: Record<string, any>;
}
