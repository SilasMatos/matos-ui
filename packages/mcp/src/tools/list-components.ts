import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRegistryIndex } from "../lib/registry-client.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

const COMPONENT_TYPES = new Set([
	"registry:ui",
	"registry:lib",
	"registry:hook",
]);

export function registerListComponents(server: McpServer) {
	server.registerTool(
		"list_components",
		{
			title: "List components",
			description:
				"List Matos UI components from the live registry (name, type, dependencies). " +
				"Descriptions are only populated for items the registry documents inline — " +
				"use get_item for the full picture of any single component.",
			inputSchema: {
				type: z
					.string()
					.optional()
					.describe(
						'Optional registry type to filter by (e.g. "registry:ui", "registry:lib"). Omit to list every component type.',
					),
			},
		},
		async ({ type }) => {
			try {
				const index = await getRegistryIndex();
				const items = index.items
					.filter((item) => COMPONENT_TYPES.has(item.type))
					.filter((item) => (type ? item.type === type : true))
					.map((item) => ({
						name: item.name,
						type: item.type,
						description: item.description,
						dependencies: item.dependencies,
						registryDependencies: item.registryDependencies,
					}));

				return jsonResult(items);
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
