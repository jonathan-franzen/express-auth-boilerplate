import bcrypt from 'bcrypt';

class BcryptService {
	async hash(text: string): Promise<string> {
		return await bcrypt.hash(text, 10);
	}

	async compare(text: string, comparisonText: string): Promise<boolean> {
		return await bcrypt.compare(text, comparisonText);
	}
}

export default BcryptService;
