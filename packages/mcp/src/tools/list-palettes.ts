import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRegistryIndex, getRegistryItem } from "../lib/registry-client.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

type ThemeItem = {
	cssVars?: {
		light?: Record<string, string>;
		dark?: Record<string, string>;
	};
};

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
				const index = await getRegistryIndex();
				const summaries = index.items.filter(
					(item) => item.type === "registry:theme",
				);

				const palettes = await Promise.all(
					summaries.map(async (summary) => {
						try {
							const item = (await getRegistryItem(summary.name)) as ThemeItem;
							return {
								name: summary.name,
								preview: {
									light: item.cssVars?.light?.primary,
									dark: item.cssVars?.dark?.primary,
								},
							};
						} catch {
							return { name: summary.name, preview: null };
						}
					}),
				);

				return jsonResult(palettes);
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
