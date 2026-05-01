"use client";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import * as React from "react";

import { Link } from "@/i18n/navigation";
import type { DocsPageTree } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
} from "@/registry/new-york-v4/ui/command";

interface PageItem {
  value: string;
  label: string;
  url: string;
  isComponent: boolean;
  keywords?: string[];
}

interface PageGroup {
  value: string;
  items: PageItem[];
}

export function CommandMenu({
  tree,
  navItems,
  ...props
}: ComponentProps<typeof CommandDialog> & {
  tree: DocsPageTree;
  navItems?: { href: string; label: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("command");

  const groupedItems = React.useMemo<PageGroup[]>(() => {
    const groups: PageGroup[] = [];

    if (navItems && navItems.length > 0) {
      groups.push({
        items: navItems.map((item) => ({
          isComponent: false,
          keywords: ["nav", "navigation", item.label.toLowerCase()],
          label: item.label,
          url: item.href,
          value: `Navigation ${item.label}`,
        })),
        value: t("pagesGroup"),
      });
    }

    tree.children.forEach((group) => {
      if (group.type === "folder") {
        const items: PageItem[] = [];
        group.children.forEach((item) => {
          if (item.type === "page") {
            const isComponent = item.url.includes("/components/");
            const itemName = item.name?.toString() || "";
            items.push({
              isComponent,
              keywords: isComponent ? ["component"] : undefined,
              label: itemName,
              url: item.url,
              value: itemName ? `${group.name} ${itemName}` : "",
            });
          }
        });
        if (items.length > 0) {
          groups.push({
            items,
            value:
              typeof group.name === "string" ? group.name : String(group.name),
          });
        }
      }
    });

    return groups;
  }, [tree, navItems, t]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog onOpenChange={setOpen} open={open} {...props}>
      <CommandDialogTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "group relative h-9 w-9 justify-center gap-2 rounded-lg border-border/70 bg-background/80 px-0 font-normal text-muted-foreground shadow-xs/5 backdrop-blur transition-all hover:border-ring/40 hover:bg-muted/60 hover:text-foreground focus-visible:border-ring/70 focus-visible:ring-ring/20 md:w-48 md:justify-start md:px-3 lg:w-40 xl:w-64 dark:bg-card/80 dark:hover:bg-muted/40",
            )}
            onClick={() => setOpen(true)}
            {...props}
          >
            <SearchIcon className="size-4 text-muted-foreground/70 transition-colors group-hover:text-foreground" />
            <span className="hidden min-w-0 flex-1 truncate text-left text-sm xl:inline-flex">
              {t("searchLong")}
            </span>
            <span className="hidden min-w-0 flex-1 truncate text-left text-sm md:inline-flex xl:hidden">
              {t("searchShort")}
            </span>
            <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded-md border bg-muted/60 px-1.5 font-medium text-[10px] text-muted-foreground/80 leading-none shadow-xs/5 xl:inline-flex">
              Ctrl K
            </kbd>
          </Button>
        }
      ></CommandDialogTrigger>
      <CommandDialogPopup className="overflow-hidden border-border/70 shadow-2xl shadow-black/10 dark:shadow-black/30">
        <Command items={groupedItems}>
          <div className="relative px-3 pt-3 pb-2">
            <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-6 size-4 text-muted-foreground/70" />
            <CommandInput
              className="h-11 rounded-xl border-border/70 bg-background/85 pl-9 pr-3 text-sm shadow-xs/5 transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/70 focus-visible:ring-3 focus-visible:ring-ring/15 dark:bg-input/25"
              placeholder={t("placeholder")}
            />
          </div>
          <CommandPanel>
            <CommandEmpty>{t("empty")}</CommandEmpty>
            <CommandList>
              {(group: PageGroup, _index: number) => (
                <CommandGroup items={group.items} key={group.value}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: PageItem) => (
                      <CommandItem
                        className="flex w-full items-center"
                        key={item.value}
                        render={
                          <Link
                            href={item.url}
                            onClick={() => setOpen(false)}
                          />
                        }
                      >
                        <span className="flex-1">{item.label}</span>
                      </CommandItem>
                    )}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandPanel>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
