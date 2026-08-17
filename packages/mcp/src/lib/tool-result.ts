import { RegistryFetchError } from "./registry-client.js";

export function jsonResult(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export function errorResult(error: unknown) {
	const message =
		error instanceof RegistryFetchError
			? error.message
			: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;

	return {
		content: [{ type: "text" as const, text: message }],
		isError: true as const,
	};
}
