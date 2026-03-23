import { Allerta, Inter } from "next/font/google";

import { Provider } from "@/components/provider";

import "./global.css";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
});

const allerta = Allerta({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allerta",
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${allerta.variable}`}
      suppressHydrationWarning
    >
      <body
        className="flex flex-col min-h-screen [--header-height:calc(var(--spacing)*13)]"
        cz-shortcut-listen="true"
      >
        <Provider>
          <SiteHeader />
          {children}
        </Provider>
      </body>
    </html>
  );
}
