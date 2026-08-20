import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchRepoFile, repoFileUrl } from "../lib/github-content.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

const MOTION_TOKENS_PATH =
	"apps/docs/src/registry/new-york-v4/lib/motion-tokens.ts";

export function registerGetMotionGuidance(server: McpServer) {
	server.registerTool(
		"get_motion_guidance",
		{
			title: "Get motion guidance",
			description:
				"Get Matos UI's Motion Tokens — the spring tiers (fast/moderate/slow/playful), motionForOffset, " +
				"staggerContainer, liftVariants, directionalVariants, the attention cues, and the JSDoc " +
				"explaining why each one exists. Returns the actual source file " +
				"(code + comments) fetched live from the docs source, rather than a hand-written summary that " +
				"could drift from what's shipped.",
			inputSchema: {},
		},
		async () => {
			try {
				const content = await fetchRepoFile(MOTION_TOKENS_PATH);

				return jsonResult({
					source: repoFileUrl(MOTION_TOKENS_PATH),
					content,
				});
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
