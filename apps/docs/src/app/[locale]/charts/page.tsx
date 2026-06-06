import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChartsShowcase } from "@/components/charts-showcase";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type PageParams = {
  locale: string;
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Charts",
  description:
    "Animated, composable and theme-aware charts for modern dashboards.",
  alternates: {
    canonical: "/charts",
  },
  openGraph: createOpenGraphMetadata({
    title: "Charts",
    description:
      "Animated, composable and theme-aware charts for modern dashboards.",
    url: "/charts",
  }),
  twitter: createTwitterMetadata({
    title: "Charts",
    description:
      "Animated, composable and theme-aware charts for modern dashboards.",
  }),
};

export default async function ChartsPage(props: {
  params: Promise<PageParams>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main
      data-slot="charts-page"
      className="min-h-[calc(100svh-var(--header-height))] bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
        <ChartsShowcase />
      </div>
    </main>
  );
}
