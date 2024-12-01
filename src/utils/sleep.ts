export function sleep(ms: number): Promise<void> {
	return new Promise<void>(
		(resolve: () => void): NodeJS.Timeout => setTimeout(resolve, ms),
	);
}

export function exponentialSleep(tryCount: number): Promise<void> {
	return sleep(1000 * Math.pow(2, tryCount));
}
