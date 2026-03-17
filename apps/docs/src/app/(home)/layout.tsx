import { HomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout {...baseOptions()}>
      <div aria-hidden className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--muted),transparent_70%)]" />
        <div className="hero-grid absolute inset-0 opacity-[0.03]" />
      </div>
      {children}
    </HomeLayout>
  );
}
