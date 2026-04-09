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
      <div aria-hidden className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.04),transparent_70%)]" />
      </div>
      {children}
    </HomeLayout>
  );
}
