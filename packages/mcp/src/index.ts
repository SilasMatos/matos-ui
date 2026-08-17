import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetInstallCommand } from "./tools/get-install-command.js";
import { registerGetItem } from "./tools/get-item.js";
import { registerListBlocks } from "./tools/list-blocks.js";
import { registerListComponents } from "./tools/list-components.js";
import { registerListPalettes } from "./tools/list-palettes.js";

const server = new McpServer({
	name: "matos-ui",
	version: "0.1.0",
});

registerListComponents(server);
registerListBlocks(server);
registerListPalettes(server);
registerGetItem(server);
registerGetInstallCommand(server);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error starting the Matos UI MCP server:", error);
	process.exit(1);
});
