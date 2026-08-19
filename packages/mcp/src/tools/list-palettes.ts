import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPalettes } from "../lib/palettes.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

export function registerListPalettes(server: McpServer) {
	server.registerTool(
		"list_palettes",
		{
			title: "List palettes",
			description:
				"List Matos UI color palettes (registry:theme items) with a primary-color preview for light and dark mode.",
			inputSchema: {},
		},
		async () => {
			try {
				const palettes = await getPalettes();
				return jsonResult(palettes);
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
