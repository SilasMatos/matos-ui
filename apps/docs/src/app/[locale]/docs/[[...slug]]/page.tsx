import { findNeighbour } from "fumadocs-core/page-tree";
import { DocsBody } from "fumadocs-ui/layouts/docs/page";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DocsCopyPage } from "@/components/docs-copy-page";
import { DocsTableOfContents } from "@/components/docs-toc";
import { Link } from "@/i18n/navigation";
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

  return (
    <div
      data-slot="docs"
      className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between md:items-start">
                <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">
                  {doc.title}
                </h1>
                <div className="docs-nav flex items-center gap-2">
                  <div className="hidden sm:block">
                    <DocsCopyPage page={raw} url={absoluteUrl(page.url)} />
                  </div>
                  <div className="ml-auto flex gap-2">
                    {neighbours.previous && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="extend-touch-target size-8 shadow-none md:size-7"
                        render={
                          <Link
                            href={neighbours.previous.url}
                            prefetch={false}
                          />
                        }
                        nativeButton={false}
                      >
                        <ArrowLeftIcon />
                        <span className="sr-only">{t("previous")}</span>
                      </Button>
                    )}
                    {neighbours.next && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="extend-touch-target size-8 shadow-none md:size-7"
                        render={
                          <Link href={neighbours.next.url} prefetch={false} />
                        }
                        nativeButton={false}
                      >
                        <span className="sr-only">{t("next")}</span>
                        <ArrowRightIcon />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {doc.description && (
                <p className="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">
                  {doc.description}
                </p>
              )}
            </div>
          </div>
          <DocsBody>
            <MDX components={getMDXComponents()} />
          </DocsBody>
          <div className="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0">
            {neighbours.previous && (
              <Button
                variant="secondary"
                size="sm"
                className="shadow-none"
                render={
                  <Link href={neighbours.previous.url} prefetch={false} />
                }
                nativeButton={false}
              >
                <ArrowLeftIcon /> {neighbours.previous.name}
              </Button>
            )}
            {neighbours.next && (
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto shadow-none"
                render={<Link href={neighbours.next.url} prefetch={false} />}
                nativeButton={false}
              >
                {neighbours.next.name} <ArrowRightIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0"></div>
        {doc.toc?.length ? (
          <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto">
            <DocsTableOfContents toc={doc.toc} />
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
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
