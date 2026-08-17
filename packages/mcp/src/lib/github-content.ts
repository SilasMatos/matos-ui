const GITHUB_OWNER = "SilasMatos";
const GITHUB_REPO = "matos-ui";
/**
 * This content lives on `dev`, not the repo's default branch, as of writing —
 * it hasn't merged yet. Reading committed text this way is low-risk (it
 * doesn't depend on anything being deployed), but the ref is still a stopgap:
 * TODO switch to the default branch once this content merges there.
 */
const GITHUB_REF = "dev";
const CACHE_TTL_MS = 5 * 60 * 1000;

export class GithubContentError extends Error {}

type CacheEntry = { data: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();

/** Fetches a repo-relative file's raw text content from GitHub. */
export async function fetchRepoFile(repoPath: string): Promise<string> {
	const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_REF}/${repoPath}`;
	const cached = cache.get(url);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.data;
	}

	let response: Response;
	try {
		response = await fetch(url);
	} catch (error) {
		throw new GithubContentError(
			`Could not reach GitHub for ${repoPath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	if (!response.ok) {
		throw new GithubContentError(
			`GitHub request for ${repoPath} (ref: ${GITHUB_REF}) failed with status ${response.status}.`,
		);
	}

	const data = await response.text();
	cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
	return data;
}

export function repoFileUrl(repoPath: string) {
	return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_REF}/${repoPath}`;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

/** Splits `---\nkey: value\n---` MDX frontmatter from the body. Best-effort, single-line values only. */
export function parseFrontmatter(mdx: string): {
	meta: Record<string, string>;
	body: string;
} {
	const match = mdx.match(FRONTMATTER);
	const frontmatterBlock = match?.[1];
	if (!match || frontmatterBlock === undefined) {
		return { meta: {}, body: mdx };
	}

	const meta: Record<string, string> = {};
	for (const line of frontmatterBlock.split("\n")) {
		const separatorIndex = line.indexOf(":");
		if (separatorIndex === -1) continue;
		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();
		if (key) meta[key] = value;
	}

	return { meta, body: mdx.slice(match[0].length) };
}
