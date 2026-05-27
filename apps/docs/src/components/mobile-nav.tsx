"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import {
  type DocsPageTree,
  getPagesFromFolder,
  type PageTreePage,
} from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

type MobileNavigationGroup = {
  id: string;
  title: ReactNode;
  pages: { id: string; label: ReactNode; url: string }[];
  count?: number;
};

function createPage(page: PageTreePage, label: ReactNode = page.name) {
  return { id: page.$id ?? page.url, label, url: page.url };
}

function createMobileGroups(tree: DocsPageTree) {
  const groups: MobileNavigationGroup[] = [];
  const documentationPages = tree.children
    .filter((item): item is PageTreePage => item.type === "page")
    .map((page) => createPage(page));

  if (documentationPages.length > 0) {
    groups.push({
      id: "documentation",
      title: "Documentation",
      pages: documentationPages,
    });
  }

  for (const item of tree.children) {
    if (item.type !== "folder") {
      continue;
    }

    const pages = getPagesFromFolder(item).map((page) => createPage(page));
    if (item.index) {
      pages.unshift(createPage(item.index, "Overview"));
    }

    if (pages.length > 0) {
      groups.push({
        id: item.$id ?? item.index?.url ?? String(item.name),
        title: item.name,
        pages,
        count: pages.length - (item.index ? 1 : 0),
      });
    }
  }

  return groups;
}

function MobileGroup({
  group,
  pathname,
  isOpen,
  shouldReduceMotion,
  onToggle,
  onNavigate,
}: {
  group: MobileNavigationGroup;
  pathname: string;
  isOpen: boolean;
  shouldReduceMotion: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const panelId = `${id}-panel`;

  return (
    <section aria-labelledby={labelId} className="mt-4">
      <h2 className="mb-1">
        <button
          type="button"
          id={labelId}
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left outline-none transition-colors duration-150 hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <span className="font-semibold text-[0.64rem] text-muted-foreground/75 uppercase tracking-[0.16em]">
            {group.title}
          </span>
          {group.count !== undefined ? (
            <span className="rounded-full border border-border/30 bg-muted/20 px-1.5 py-px font-medium text-[9px] text-muted-foreground/70 tabular-nums leading-none">
              {group.count}
            </span>
          ) : null}
          <span aria-hidden="true" className="h-px flex-1 bg-border/25" />
          <motion.span
            aria-hidden="true"
            className="flex text-muted-foreground/55"
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.18, ease: [0.2, 0, 0, 1] }
            }
          >
            <ChevronDown className="size-3" />
          </motion.span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="mobile-group-content"
            id={panelId}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.4, 0, 0.2, 1] }
            }
            className="overflow-hidden"
          >
            <ul className="space-y-px rounded-md bg-muted/20 p-0.5">
              {group.pages.map((page) => (
                <li key={page.id}>
                  <MobileLink
                    href={page.url}
                    isActive={page.url === pathname}
                    onNavigate={onNavigate}
                  >
                    {page.label}
                  </MobileLink>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function MobileNav({
  tree,
  className,
}: {
  tree: DocsPageTree;
  items: { href: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const shouldReduceMotion = Boolean(useReducedMotion());
  const pathname = usePathname();
  const t = useTranslations("common");
  const groups = createMobileGroups(tree);

  function toggleGroup(groupId: string) {
    setCollapsedGroups((currentGroups) => {
      const nextGroups = new Set(currentGroups);
      if (nextGroups.has(groupId)) {
        nextGroups.delete(groupId);
      } else {
        nextGroups.add(groupId);
      }
      return nextGroups;
    });
  }

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
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 motion-reduce:transition-none",
                    open ? "top-[0.4rem] -rotate-45" : "top-1",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100 motion-reduce:transition-none",
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
        className="h-(--available-height) w-(--available-width) overflow-hidden rounded-none border-none bg-background/94 p-0 shadow-none backdrop-blur duration-100 data-open:animate-none!"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={14}
      >
        <nav
          aria-label="Documentation navigation"
          className="h-full overflow-y-auto px-4 pb-8 pt-5 [scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--border)_45%,transparent)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/40"
        >
          <div className="mb-4">
            <p className="mb-2 px-2 font-semibold text-[0.65rem] text-muted-foreground/75 uppercase tracking-[0.16em]">
              Site
            </p>
            <MobileLink
              href="/"
              isActive={pathname === "/"}
              onNavigate={() => setOpen(false)}
            >
              {t("home")}
            </MobileLink>
          </div>
          {groups.map((group) => (
            <MobileGroup
              key={group.id}
              group={group}
              pathname={pathname}
              isOpen={!collapsedGroups.has(group.id)}
              shouldReduceMotion={shouldReduceMotion}
              onToggle={() => toggleGroup(group.id)}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  );
}

function MobileLink({
  href,
  isActive = false,
  onNavigate,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  isActive?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={() => onNavigate?.()}
      className={cn(
        "relative flex h-9 min-w-0 items-center rounded-md px-3 text-sm font-medium outline-none transition-[background-color,color,transform] duration-150 ease-out",
        "hover:translate-x-px hover:bg-muted/40 hover:text-foreground motion-reduce:transform-none motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        isActive ? "bg-muted/45 pl-5 text-foreground" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {isActive ? (
        <span className="absolute inset-y-2.5 left-2 w-0.5 rounded-full bg-foreground/70" />
      ) : null}
      <span className="truncate">{children}</span>
    </Link>
  );
}
