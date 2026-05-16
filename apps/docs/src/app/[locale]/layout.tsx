import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Provider } from "@/components/provider";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { source } from "@/lib/source";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
      className={`${geist.className} ${geist.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="icon"
          href="/logo-black-fiv.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/logo-white-fiv.png"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className="flex flex-col min-h-screen [--header-height:calc(var(--spacing)*13)]"
        cz-shortcut-listen="true"
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
