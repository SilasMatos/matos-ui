import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";

import { i18n } from "@/lib/i18n";
import { getPagesFromFolder, type PageTreePage } from "@/lib/page-tree";

export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: docs.toFumadocsSource(),
  plugins: [],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.webp"];

  return {
    segments,
    url: `/og/docs/${page.locale}/${segments.join("/")}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}

/**
 * Páginas dentro de /docs/components — a contagem real do catálogo, usada tanto
 * pelo badge do hero quanto pela listagem em /docs/components.
 */
export function getComponentPages(locale: string): PageTreePage[] {
  const folder = source
    .getPageTree(locale)
    .children.find((child) => child.$id?.split(":").at(-1) === "components");

  return folder?.type === "folder" ? getPagesFromFolder(folder) : [];
}
