import { HomeLayout } from "fumadocs-ui/layouts/home";
import { setRequestLocale } from "next-intl/server";

import { baseOptions } from "@/lib/layout.shared";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function HomeRouteLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <HomeLayout {...baseOptions(locale)}>
      <div aria-hidden className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--muted),transparent_70%)]" />
        <div className="hero-grid absolute inset-0 opacity-[0.03]" />
      </div>
      {children}
    </HomeLayout>
  );
}
