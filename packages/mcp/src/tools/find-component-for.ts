import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
	getRegistryIndex,
	type RegistryItemSummary,
} from "../lib/registry-client.js";
import { scoreByTokens, tokenize } from "../lib/search.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

const SEARCHABLE_TYPES = new Set(["registry:ui", "registry:block"]);
const MAX_RESULTS = 5;

export function registerFindComponentFor(server: McpServer) {
	server.registerTool(
		"find_component_for",
		{
			title: "Find component for use case",
			description:
				"Search Matos UI components and blocks by use case (e.g. 'user sign in form', 'candlestick chart', " +
				"'notification toast'). Scores by keyword overlap against item names, descriptions (where the " +
				"registry documents one — blocks have them, most individual UI components don't yet) and " +
				"dependencies. Not semantic search: exact/related words work better than abstract phrasing. " +
				"Use get_item on a result for full detail.",
			inputSchema: {
				use_case: z
					.string()
					.describe("What you're trying to build, in a few words."),
			},
		},
		async ({ use_case }) => {
			try {
				const queryTokens = tokenize(use_case);
				if (queryTokens.size === 0) {
					return jsonResult({
						query: use_case,
						matches: [],
						note: "No searchable keywords in that query — try naming the UI pattern or domain concept directly.",
					});
				}

				const index = await getRegistryIndex();
				const candidates = index.items.filter((item) =>
					SEARCHABLE_TYPES.has(item.type),
				);

				const scored = scoreByTokens(
					candidates,
					queryTokens,
					(item: RegistryItemSummary) => [
						{ weight: 3, tokens: tokenize(item.name) },
						{
							weight: 2,
							tokens: item.description
								? tokenize(item.description)
								: new Set<string>(),
						},
						{
							weight: 1,
							tokens: tokenize((item.dependencies ?? []).join(" ")),
						},
					],
				);

				const matches = scored
					.slice(0, MAX_RESULTS)
					.map(({ item, matchedTokens }) => ({
						name: item.name,
						type: item.type,
						description: item.description,
						why: `Matched on: ${matchedTokens.map((token) => `"${token}"`).join(", ")}`,
					}));

				return jsonResult({
					query: use_case,
					matches,
					note:
						matches.length === 0
							? "No keyword overlap found. Try list_components/list_blocks and skim names, or rephrase with a more literal term."
							: undefined,
				});
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
