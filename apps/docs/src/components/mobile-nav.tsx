"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import * as React from "react";

import { Link } from "@/i18n/navigation";
import { type DocsPageTree, getPagesFromFolder } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

export function MobileNav({
  tree,
  items,
  className,
}: {
  tree: DocsPageTree;
  items: { href: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("common");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "extend-touch-target size-8 touch-manipulation hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/70 dark:hover:bg-muted/50",
              className,
            )}
            aria-label={t("menu")}
          >
            <div className="relative flex h-8 w-4 items-center justify-center">
              <div className="relative size-4">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                    open ? "top-[0.4rem] -rotate-45" : "top-1",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                    open ? "top-[0.4rem] rotate-45" : "top-2.5",
                  )}
                />
              </div>
              <span className="sr-only">{t("menu")}</span>
            </div>
          </Button>
        }
      />
      <PopoverContent
        className="no-scrollbar h-(--available-height) w-(--available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100 data-open:animate-none!"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={14}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              {t("menu")}
            </div>
            <div className="flex flex-col gap-3">
              <MobileLink href="/" onNavigate={() => setOpen(false)}>
                {t("home")}
              </MobileLink>
              {items.map((item) => (
                <MobileLink
                  key={item.href}
                  href={item.href}
                  onNavigate={() => setOpen(false)}
                >
                  {item.label}
                </MobileLink>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {tree.children.map((group) => {
              if (group.type === "folder") {
                const pages = getPagesFromFolder(group);
                return (
                  <div key={group.$id} className="flex flex-col gap-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      {group.name}
                    </div>
                    <div className="flex flex-col gap-3">
                      {pages.map((item) => (
                        <MobileLink
                          key={item.$id}
                          href={item.url}
                          onNavigate={() => setOpen(false)}
                          className="flex items-center gap-2"
                        >
                          {item.name}
                        </MobileLink>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileLink({
  href,
  onNavigate,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  onNavigate?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={cn("flex items-center gap-2 text-2xl font-medium", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
