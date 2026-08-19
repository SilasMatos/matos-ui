import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	fetchRepoFile,
	parseFrontmatter,
	repoFileUrl,
} from "../lib/github-content.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

const ELEVATED_DOC_PATH = "apps/docs/content/docs/foundations/elevated.mdx";

export function registerGetSurfacePhilosophy(server: McpServer) {
	server.registerTool(
		"get_surface_philosophy",
		{
			title: "Get surface philosophy",
			description:
				"Get Matos UI's Surface Philosophy — the Elevated primitive, substrate context, and elevation " +
				"offset conventions (dropdown/popover vs dialog, nesting). Fetched live from the docs source " +
				"so this can't drift out of sync with what's actually shipped; the source is the single " +
				"authority, this tool does not add or reinterpret anything.",
			inputSchema: {},
		},
		async () => {
			try {
				const raw = await fetchRepoFile(ELEVATED_DOC_PATH);
				const { meta, body } = parseFrontmatter(raw);

				return jsonResult({
					source: repoFileUrl(ELEVATED_DOC_PATH),
					title: meta.title,
					description: meta.description,
					content: body.trim(),
				});
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
