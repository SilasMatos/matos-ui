import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CustomizeStudio } from "@/components/customize-studio";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type PageParams = {
  locale: string;
};

const title = "Customize";
const description =
  "Pick a palette and a radius, watch real Matos UI components react live, and copy the install command and CSS you need.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description,
  alternates: {
    canonical: "/customize",
  },
  openGraph: createOpenGraphMetadata({
    title,
    description,
    url: "/customize",
  }),
  twitter: createTwitterMetadata({
    title,
    description,
  }),
};

export default async function CustomizePage(props: {
  params: Promise<PageParams>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main
      data-slot="customize-page"
      className="min-h-[calc(100svh-var(--header-height))] bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-6">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
            Registry
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Customize
          </h1>
          <p className="mt-2 max-w-[60ch] text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </header>
        <CustomizeStudio />
      </div>
    </main>
  );
}
