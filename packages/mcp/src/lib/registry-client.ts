const CACHE_TTL_MS = 5 * 60 * 1000;

export class RegistryFetchError extends Error {}

export type RegistryItemSummary = {
	name: string;
	type: string;
	description?: string;
	dependencies?: string[];
	devDependencies?: string[];
	registryDependencies?: string[];
};

export type RegistryIndex = {
	name: string;
	homepage?: string;
	items: RegistryItemSummary[];
};

/**
 * No default here on purpose. matos-ui.com is currently behind the `dev`
 * branch (missing blocks, palettes, and several components), so silently
 * falling back to it would hand back stale or 404ing data without saying so.
 * TODO: once production is back in sync with `dev` and this package is ready
 * to publish, restore a `https://matos-ui.com` default here.
 */
function getBaseUrl() {
	const configured = process.env.MATOS_UI_REGISTRY_URL;
	if (!configured) {
		throw new RegistryFetchError(
			"MATOS_UI_REGISTRY_URL is not set. This server has no implicit registry to fall back " +
				"to right now — point it at a running Matos UI docs instance, e.g. " +
				'MATOS_UI_REGISTRY_URL="http://localhost:4000".',
		);
	}
	return configured.replace(/\/+$/, "");
}

type CacheEntry = { data: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

async function fetchJson<T>(pathname: string): Promise<T> {
	const url = `${getBaseUrl()}${pathname}`;
	const cached = cache.get(url);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.data as T;
	}

	let response: Response;
	try {
		response = await fetch(url);
	} catch (error) {
		throw new RegistryFetchError(
			`Could not reach the Matos UI registry at ${url}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	if (!response.ok) {
		throw new RegistryFetchError(
			`Registry request to ${url} failed with status ${response.status}.`,
		);
	}

	let data: T;
	try {
		data = (await response.json()) as T;
	} catch {
		throw new RegistryFetchError(
			`Registry response from ${url} was not valid JSON.`,
		);
	}

	cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
	return data;
}

/** The lean registry index (name/type/deps for every item, no file content). */
export async function getRegistryIndex(): Promise<RegistryIndex> {
	return fetchJson<RegistryIndex>("/r/registry.json");
}

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/** Full registry item (files with content, cssVars, etc). */
export async function getRegistryItem(
	name: string,
): Promise<Record<string, unknown>> {
	if (!SAFE_NAME.test(name)) {
		throw new RegistryFetchError(
			`"${name}" is not a valid registry item name.`,
		);
	}
	return fetchJson<Record<string, unknown>>(`/r/${name}.json`);
}

export function getRegistryUrl(name: string) {
	return `${getBaseUrl()}/r/${name}.json`;
}
