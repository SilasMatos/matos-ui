import { getRegistryIndex, getRegistryItem } from "./registry-client.js";

type ThemeItem = {
	cssVars?: {
		light?: Record<string, string>;
		dark?: Record<string, string>;
	};
};

export type PaletteSummary = {
	name: string;
	preview: { light?: string; dark?: string } | null;
};

export async function getPalettes(): Promise<PaletteSummary[]> {
	const index = await getRegistryIndex();
	const summaries = index.items.filter(
		(item) => item.type === "registry:theme",
	);

	return Promise.all(
		summaries.map(async (summary): Promise<PaletteSummary> => {
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
}
