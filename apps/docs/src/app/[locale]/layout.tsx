import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Provider } from "@/components/provider";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
  siteKeywords,
} from "@/lib/seo";
import { source } from "@/lib/source";

// Site typography. This is docs-app styling only — registry components stay
// typography-neutral and inherit whatever the consuming project uses.
const satoshi = localFont({
  src: [
    {
      path: "../../fonts/satoshi/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  // Source variables are named after the typeface, not after the role. The
  // roles (--font-sans / --font-display / --font-mono) are mapped from these in
  // global.css; naming both ends the same would make the @theme entry
  // self-referential and resolve to an invalid cyclic var().
  variable: "--font-satoshi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteKeywords,
  authors: [{ name: "Silas Matos", url: siteConfig.links.github }],
  creator: "Silas Matos",
  publisher: siteConfig.name,
  icons: {
    icon: [
      {
        url: "/logo-black-fiv.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-white-fiv.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/logo-black-fiv.png",
    apple: "/logo-black-fiv.png",
  },
  openGraph: createOpenGraphMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  }),
  twitter: createTwitterMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
  }),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const pageTree = source.getPageTree(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${satoshi.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans flex flex-col min-h-screen [--header-height:calc(var(--spacing)*13)]"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Provider>
            <SiteHeader pageTree={pageTree} />
            {children}
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
