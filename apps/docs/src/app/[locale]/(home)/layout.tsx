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

  return <HomeLayout {...baseOptions(locale)}>{children}</HomeLayout>;
}
