import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchRepoFile, repoFileUrl } from "../lib/github-content.js";
import { getPalettes, type PaletteSummary } from "../lib/palettes.js";
import { errorMessage, jsonResult } from "../lib/tool-result.js";

const THEME_CUSTOMIZER_PATH = "apps/docs/src/lib/theme-customizer.ts";

type RadiusPreset = { id: string; label: string; value: string };

const RADIUS_PRESET_ENTRY =
	/\{\s*id:\s*"([a-z0-9-]+)"\s*,\s*label:\s*"([^"]+)"\s*,\s*value:\s*"([^"]+)"\s*\}/g;

async function getRadiusPresets(): Promise<RadiusPreset[]> {
	const source = await fetchRepoFile(THEME_CUSTOMIZER_PATH);
	const presets: RadiusPreset[] = [];
	for (const match of source.matchAll(RADIUS_PRESET_ENTRY)) {
		const [, id, label, value] = match;
		if (id && label && value) {
			presets.push({ id, label, value });
		}
	}

	if (presets.length === 0) {
		throw new Error(
			`Could not find any radius presets in ${THEME_CUSTOMIZER_PATH} — its shape may have changed.`,
		);
	}

	return presets;
}

export function registerGetThemeOptions(server: McpServer) {
	server.registerTool(
		"get_theme_options",
		{
			title: "Get theme options",
			description:
				"Get Matos UI's theming primitives: the color palettes and the four radius presets " +
				"(Sharp/Subtle/Default/Round), structured so an agent can apply them directly when " +
				"generating already-customized code. Palettes come from the live registry (needs " +
				"MATOS_UI_REGISTRY_URL); radius presets come from the docs source and don't.",
			inputSchema: {},
		},
		async () => {
			const [palettesResult, radiusResult] = await Promise.allSettled([
				getPalettes(),
				getRadiusPresets(),
			]);

			const palettes: PaletteSummary[] | undefined =
				palettesResult.status === "fulfilled"
					? palettesResult.value
					: undefined;
			const palettesError =
				palettesResult.status === "rejected"
					? errorMessage(palettesResult.reason)
					: undefined;

			const radiusPresets: RadiusPreset[] | undefined =
				radiusResult.status === "fulfilled" ? radiusResult.value : undefined;
			const radiusPresetsError =
				radiusResult.status === "rejected"
					? errorMessage(radiusResult.reason)
					: undefined;

			return jsonResult({
				palettes,
				palettesError,
				radiusPresets,
				radiusPresetsSource: radiusPresets
					? repoFileUrl(THEME_CUSTOMIZER_PATH)
					: undefined,
				radiusPresetsError,
			});
		},
	);
}
