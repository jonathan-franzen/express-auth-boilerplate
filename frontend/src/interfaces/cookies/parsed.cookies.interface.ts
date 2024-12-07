export interface ParsedCookiesInterface {
	Path?: string;
	HttpOnly?: string;
	Secure?: string;
	SameSite?: 'Strict' | 'Lax' | 'None';
	MaxAge?: string;
}
