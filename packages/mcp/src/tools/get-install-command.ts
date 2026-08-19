import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRegistryItem, getRegistryUrl } from "../lib/registry-client.js";
import { errorResult, jsonResult } from "../lib/tool-result.js";

const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

function buildCommand(packageManager: PackageManager, url: string) {
	switch (packageManager) {
		case "npm":
			return `npx shadcn@latest add ${url}`;
		case "pnpm":
			return `pnpm dlx shadcn@latest add ${url}`;
		case "yarn":
			return `yarn dlx shadcn@latest add ${url}`;
		case "bun":
			return `bunx --bun shadcn@latest add ${url}`;
	}
}

export function registerGetInstallCommand(server: McpServer) {
	server.registerTool(
		"get_install_command",
		{
			title: "Get install command",
			description:
				"Get the ready-to-run shadcn CLI command to install a Matos UI item, for a given package manager. " +
				"This tool only returns a string — it does not execute anything itself.",
			inputSchema: {
				name: z
					.string()
					.describe(
						'Registry item name, e.g. "badge" or "dashboard-overview-01".',
					),
				packageManager: z
					.enum(PACKAGE_MANAGERS)
					.default("npm")
					.describe("Package manager to build the command for."),
			},
		},
		async ({ name, packageManager }) => {
			try {
				// Validates the item exists before handing back a command for it.
				await getRegistryItem(name);
				const command = buildCommand(packageManager, getRegistryUrl(name));
				return jsonResult({ name, packageManager, command });
			} catch (error) {
				return errorResult(error);
			}
		},
	);
}
