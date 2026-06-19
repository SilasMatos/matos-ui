import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ChartFullscreenViewer } from "@/components/chart-fullscreen-viewer";
import { chartCollection, getChartById } from "@/lib/charts";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type PageParams = {
  locale: string;
  chart: string;
};

export default async function ChartPreviewPage(props: {
  params: Promise<PageParams>;
}) {
  const { locale, chart: chartId } = await props.params;
  setRequestLocale(locale);

  const chart = getChartById(chartId);
  if (!chart) {
    notFound();
  }

  return <ChartFullscreenViewer chartId={chart.id} />;
}

export function generateStaticParams() {
  return chartCollection.map((chart) => ({
    locale: "en",
    chart: chart.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { chart: chartId } = await props.params;
  const chart = getChartById(chartId);
  if (!chart) {
    notFound();
  }

  const title = `${chart.name} Preview`;
  const description = `${chart.name} fullscreen preview for the Matos UI Charts collection.`;
  const url = `/charts/${chart.id}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: createOpenGraphMetadata({
      title,
      description,
      url,
    }),
    twitter: createTwitterMetadata({
      title,
      description,
    }),
  };
}
