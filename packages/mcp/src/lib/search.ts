const STOPWORDS = new Set([
	"a",
	"an",
	"the",
	"for",
	"with",
	"and",
	"or",
	"to",
	"of",
	"in",
	"on",
	"is",
	"that",
	"this",
	"i",
	"need",
	"want",
	"some",
	"component",
	"components",
	"ui",
]);

export function tokenize(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((word) => word.length > 1 && !STOPWORDS.has(word)),
	);
}

export type ScoredMatch<T> = {
	item: T;
	score: number;
	matchedTokens: string[];
};

/**
 * Keyword-overlap scoring: no embeddings, just weighted token intersection
 * against a query. Good enough for a handful of catalog-sized results; swap
 * for something smarter if the catalog grows past hundreds of items.
 */
export function scoreByTokens<T>(
	items: T[],
	queryTokens: Set<string>,
	weigh: (item: T) => { weight: number; tokens: Set<string> }[],
): ScoredMatch<T>[] {
	return items
		.map((item) => {
			let score = 0;
			const matchedTokens = new Set<string>();

			for (const { weight, tokens } of weigh(item)) {
				for (const token of tokens) {
					if (queryTokens.has(token)) {
						score += weight;
						matchedTokens.add(token);
					}
				}
			}

			return { item, score, matchedTokens: [...matchedTokens] };
		})
		.filter((match) => match.score > 0)
		.sort((a, b) => b.score - a.score);
}
