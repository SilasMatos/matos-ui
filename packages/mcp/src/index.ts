import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerFindComponentFor } from "./tools/find-component-for.js";
import { registerGetInstallCommand } from "./tools/get-install-command.js";
import { registerGetItem } from "./tools/get-item.js";
import { registerGetMotionGuidance } from "./tools/get-motion-guidance.js";
import { registerGetSurfacePhilosophy } from "./tools/get-surface-philosophy.js";
import { registerGetThemeOptions } from "./tools/get-theme-options.js";
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
registerFindComponentFor(server);
registerGetSurfacePhilosophy(server);
registerGetMotionGuidance(server);
registerGetThemeOptions(server);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	// stdout is reserved for JSON-RPC; stderr is safe for a human-readable
	// status line so a bare `npx @matos-ui/mcp` doesn't look hung when it's
	// just waiting for a client to speak first.
	console.error("Matos UI MCP server running on stdio.");
}

main().catch((error) => {
	console.error("Fatal error starting the Matos UI MCP server:", error);
	process.exit(1);
});
