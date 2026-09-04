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
            // `ghost`, not `outline`: outline's own border + bg-background
            // would fight the surface classes below. The literal
            // `hover:bg-surface-3` is not interpolation-shy pedantry — a
            // variant spliced onto a runtime string is invisible to Tailwind's
            // scanner (see lib/surface-classes.ts).
            variant="ghost"
            className={cn(
              "group relative size-8 justify-center gap-2 rounded-lg px-0 font-normal text-muted-foreground md:w-44 md:justify-start md:px-3 lg:w-40 xl:w-56",
              // `dark:hover:bg-surface-3` is not redundant with the line's
              // `hover:` twin: tailwind-merge treats a different modifier
              // chain as a different group, so ghost's own
              // `dark:hover:bg-muted/50` survives the merge and then outranks
              // us in dark mode on the extra `.dark` ancestor.
              "bg-surface-2 shadow-surface-2 hover:bg-surface-3 dark:hover:bg-surface-3 hover:shadow-surface-3 hover:text-foreground",
              "focus-visible:ring-ring/20",
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
            {/* One rung above the button it sits in, so the key reads as a
                key. The bare `border` it used to carry resolved to
                currentColor — this project has no base border-color rule. */}
            <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded-md bg-surface-3 px-1.5 font-medium text-[10px] text-muted-foreground/80 leading-none xl:inline-flex">
              Ctrl K
            </kbd>
          </Button>
        }
      ></CommandDialogTrigger>
      {/* No border and no hand-picked shadow: the popup is an <Elevated> now,
          so its edge and its drop both come off the ladder. */}
      <CommandDialogPopup className="overflow-hidden">
        <Command items={groupedItems}>
          <div className="px-3 pt-3 pb-2">
            <CommandInput
              // The icon goes through `startAddon`, which positions it inside
              // the input's own box and pads the text for it. The old absolute
              // `left-6` was measured against this padding wrapper, so it sat
              // off-centre vertically (pt-3/pb-2 are not symmetric) and only
              // lined up horizontally by coincidence.
              startAddon={
                <SearchIcon className="size-4 text-muted-foreground/70" />
              }
              // Only sizing and typography left here. The fill used to be
              // `bg-background/85`, which dropped a panel nested four rungs up
              // the ladder back onto the page colour.
              className="h-11 rounded-xl pr-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-3 focus-visible:ring-ring/15"
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
