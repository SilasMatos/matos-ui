import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BlocksShowcase } from "@/components/blocks-showcase";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type PageParams = {
  locale: string;
};

const title = "Blocks";
const description =
  "Ready-made interface compositions built from Matos UI components. Preview, copy and install full blocks with a single command.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description,
  alternates: {
    canonical: "/blocks",
  },
  openGraph: createOpenGraphMetadata({
    title,
    description,
    url: "/blocks",
  }),
  twitter: createTwitterMetadata({
    title,
    description,
  }),
};

export default async function BlocksPage(props: {
  params: Promise<PageParams>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main
      data-slot="blocks-page"
      className="min-h-[calc(100svh-var(--header-height))] bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
        <BlocksShowcase />
      </div>
    </main>
  );
}
