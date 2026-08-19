import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRegistryItem } from "../lib/registry-client.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

export function registerGetItem(server: McpServer) {
	server.registerTool(
		"get_item",
		{
			title: "Get registry item",
			description:
				"Fetch the full registry entry for a single Matos UI item (component, block, or palette) by name — " +
				"includes file contents, dependencies, registryDependencies, and cssVars where applicable.",
			inputSchema: {
				name: z
					.string()
					.describe(
						'Registry item name, e.g. "badge" or "dashboard-overview-01".',
					),
			},
		},
		async ({ name }) => {
			try {
				const item = await getRegistryItem(name);
				return jsonResult(item);
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
