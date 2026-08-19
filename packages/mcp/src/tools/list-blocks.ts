import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRegistryIndex } from "../lib/registry-client.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

export function registerListBlocks(server: McpServer) {
	server.registerTool(
		"list_blocks",
		{
			title: "List blocks",
			description:
				"List Matos UI blocks (composed, page-level sections such as dashboards or settings screens) from the live registry.",
			inputSchema: {},
		},
		async () => {
			try {
				const index = await getRegistryIndex();
				const blocks = index.items
					.filter((item) => item.type === "registry:block")
					.map((item) => ({
						name: item.name,
						description: item.description,
						dependencies: item.dependencies,
						registryDependencies: item.registryDependencies,
					}));

				return jsonResult(blocks);
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
