export function jsonResult(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export function errorMessage(error: unknown): string {
	return error instanceof Error
		? error.message
		: `Unexpected error: ${String(error)}`;
}

export function errorResult(error: unknown) {
	return {
		content: [{ type: "text" as const, text: errorMessage(error) }],
		isError: true as const,
	};
}
