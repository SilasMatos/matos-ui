import { findNeighbour } from "fumadocs-core/page-tree";
import { DocsBody } from "fumadocs-ui/layouts/docs/page";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DocsCopyPage } from "@/components/docs-copy-page";
import { DocsDeployCard } from "@/components/docs-deploy-card";
import {
  DocsPageBody,
  DocsPageBottomNav,
  DocsPageHeader,
} from "@/components/docs-page-animations";
import { DocsTableOfContents } from "@/components/docs-toc";
import { Link } from "@/i18n/navigation";
import { getComponentSkillDoc } from "@/lib/component-skill-doc";
import { getSiteUrl } from "@/lib/site-url";
import { getPageImage, source } from "@/lib/source";
import { absoluteUrl } from "@/lib/utils";
import { getMDXComponents } from "@/mdx-components";
import { Button } from "@/registry/new-york-v4/ui/button";

type PageParams = { locale: string; slug?: string[] };

export default async function Page(props: { params: Promise<PageParams> }) {
  const params = await props.params;
  const { locale, slug } = params;
  setRequestLocale(locale);

  const page = source.getPage(slug ?? [], locale);
  if (!page) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "docs" });
  const doc = page.data;
  const MDX = doc.body;
  const isChangelog = params.slug?.[0] === "changelog";
  const pageTree = source.getPageTree(locale);
  const neighbours = isChangelog
    ? { previous: null, next: null }
    : findNeighbour(pageTree, page.url);
  const raw = await page.data.getText("raw");
  const pageUrl = absoluteUrl(page.url);
  const skillDoc = getComponentSkillDoc({
    title: doc.title,
    description: doc.description,
    slug: params.slug,
    raw,
    url: pageUrl,
  });

  const actions = (
    <>
      <div>
        <DocsCopyPage
          page={skillDoc ?? raw}
          url={pageUrl}
          copyLabel={skillDoc ? "Copy SKILL.md" : "Copy Page"}
        />
      </div>
      {neighbours.previous && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 shadow-none"
          render={<Link href={neighbours.previous.url} prefetch={false} />}
          nativeButton={false}
        >
          <ArrowLeftIcon className="size-3.5" />
          <span className="sr-only">{t("previous")}</span>
        </Button>
      )}
      {neighbours.next && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 shadow-none"
          render={<Link href={neighbours.next.url} prefetch={false} />}
          nativeButton={false}
        >
          <span className="sr-only">{t("next")}</span>
          <ArrowRightIcon className="size-3.5" />
        </Button>
      )}
    </>
  );

  const hasBottomNav = !!neighbours.previous || !!neighbours.next;

  return (
    <div
      data-slot="docs"
      className="grid w-full scroll-mt-24 grid-cols-1 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:grid-cols-[minmax(0,1fr)_var(--sidebar-width)]"
    >
      <div className="flex min-w-0 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-[768px] min-w-0 flex-1 flex-col gap-5 px-4 py-5 text-neutral-800 md:px-0 lg:py-6 dark:text-neutral-300">
          <DocsPageHeader
            title={doc.title}
            description={doc.description}
            actions={actions}
          />

          <DocsPageBody>
            <DocsBody>
              <MDX components={getMDXComponents()} />
            </DocsBody>
          </DocsPageBody>

          {hasBottomNav && (
            <DocsPageBottomNav>
              {neighbours.previous && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground hover:text-foreground shadow-none text-xs"
                  render={
                    <Link href={neighbours.previous.url} prefetch={false} />
                  }
                  nativeButton={false}
                >
                  <ArrowLeftIcon className="size-3.5" />{" "}
                  {neighbours.previous.name}
                </Button>
              )}
              {neighbours.next && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-8 gap-1.5 text-muted-foreground hover:text-foreground shadow-none text-xs"
                  render={<Link href={neighbours.next.url} prefetch={false} />}
                  nativeButton={false}
                >
                  {neighbours.next.name} <ArrowRightIcon className="size-3.5" />
                </Button>
              )}
            </DocsPageBottomNav>
          )}
        </div>
      </div>

      {/* Right TOC */}
      <div className="sticky top-[calc(var(--header-height)+0.75rem)] z-30 hidden h-[calc(100svh-var(--header-height)-1.5rem)] w-(--sidebar-width) flex-col gap-6 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0"></div>
        {doc.toc?.length ? (
          <div className="no-scrollbar flex flex-1 flex-col gap-8 overflow-y-auto px-2">
            <DocsTableOfContents toc={doc.toc} />
            <DocsDeployCard />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return source.generateParams("slug", "locale");
}

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale, slug } = params;
  const page = source.getPage(slug ?? [], locale);
  if (!page) notFound();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
