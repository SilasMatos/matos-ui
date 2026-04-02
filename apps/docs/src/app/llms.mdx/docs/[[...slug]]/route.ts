import { notFound } from "next/navigation";

import { i18n } from "@/lib/i18n";
import { getLLMText, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1), i18n.defaultLanguage);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.getPages(i18n.defaultLanguage).map((page) => ({
    slug: [...page.slugs, "index.mdx"],
  }));
}
