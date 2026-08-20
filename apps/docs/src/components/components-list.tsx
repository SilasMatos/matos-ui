import { ChevronRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getComponentPages } from "@/lib/source";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export async function ComponentsList() {
  const locale = await getLocale();
  const list = getComponentPages(locale);

  if (list.length === 0) {
    return null;
  }

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
        <Elevated
          offset={1}
          className="rounded-full px-2.5 py-1 text-muted-foreground text-xs"
        >
          {list.length} items
        </Elevated>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((component, index) => (
          <Link
            key={component.$id}
            href={component.url}
            // The link stays the interactive target (focus ring, hit area); the
            // surface itself is drawn by the <Elevated> inside it.
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Elevated
              offset={1}
              className="relative flex h-full min-h-16 items-center justify-between gap-3 overflow-hidden rounded-lg px-4 py-3 text-sm"
            >
              <span className="absolute inset-x-4 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
              <span className="flex min-w-0 items-center gap-3">
                <Elevated
                  offset={1}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground text-xs transition-colors duration-200 group-hover:text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </Elevated>
                <span className="truncate font-medium text-foreground">
                  {component.name}
                </span>
              </span>
              <span className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground text-xs">
                <ChevronRight />
              </span>
            </Elevated>
          </Link>
        ))}
      </div>
    </section>
  );
}
