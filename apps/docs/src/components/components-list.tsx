import { ChevronRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPagesFromFolder } from "@/lib/page-tree";
import { source } from "@/lib/source";

export async function ComponentsList() {
  const locale = await getLocale();
  const tree = source.getPageTree(locale);
  const componentsFolder = tree.children.find(
    (page) => page.$id?.split(":").at(-1) === "components",
  );

  if (componentsFolder?.type !== "folder") {
    return null;
  }

  const list = getPagesFromFolder(componentsFolder);

  return (
    <section className="not-prose space-y-4">
      <div className="flex items-end justify-between gap-4 border-border border-b pb-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            Registry
          </p>
          <h2 className="mt-1 text-balance font-semibold text-foreground text-xl tracking-tight">
            Components
          </h2>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground text-xs">
          {list.length} items
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((component, index) => (
          <Link
            key={component.$id}
            href={component.url}
            className="group relative flex min-h-16 items-center justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors duration-200 hover:border-primary/30 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="absolute inset-x-4 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground text-xs transition-colors duration-200 group-hover:border-primary/25 group-hover:text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate font-medium text-foreground">
                {component.name}
              </span>
            </span>
            <span className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground text-xs">
              <ChevronRight />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
