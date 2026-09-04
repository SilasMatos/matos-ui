import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BlockCodePanel } from "@/components/block-code-panel";
import { BlockViewer } from "@/components/block-viewer";
import {
  blockCollection,
  getBlockById,
  getBlockInstallCommand,
} from "@/lib/blocks";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type PageParams = {
  locale: string;
  block: string;
};

export function generateStaticParams() {
  return blockCollection.map((block) => ({
    locale: "en",
    block: block.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { block: blockId } = await props.params;
  const block = getBlockById(blockId);

  if (!block) {
    notFound();
  }

  const title = `${block.name} Block`;
  const url = `/blocks/${block.id}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description: block.description,
    alternates: {
      canonical: url,
    },
    openGraph: createOpenGraphMetadata({
      title,
      description: block.description,
      url,
    }),
    twitter: createTwitterMetadata({
      title,
      description: block.description,
    }),
  };
}

export default async function BlockPage(props: {
  params: Promise<PageParams>;
}) {
  const { locale, block: blockId } = await props.params;
  setRequestLocale(locale);

  const block = getBlockById(blockId);
  if (!block) {
    notFound();
  }

  return (
    <main
      data-slot="block-page"
      className="min-h-[calc(100svh-var(--header-height))] bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
        <BlockViewer
          block={block}
          installCommand={getBlockInstallCommand(block.id)}
          codePanel={<BlockCodePanel id={block.id} />}
        />
      </div>
    </main>
  );
}
