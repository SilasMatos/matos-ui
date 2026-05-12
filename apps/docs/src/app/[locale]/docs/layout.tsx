import { setRequestLocale } from "next-intl/server";

import { DocsSidebar } from "@/components/docs-sidebar";
import { source } from "@/lib/source";
import { SidebarProvider } from "@/registry/new-york-v4/ui/sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DocsLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tree = source.getPageTree(locale);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-6">
      <SidebarProvider
        className="min-h-min w-full flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <DocsSidebar tree={tree} />
        <div className="h-full w-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
