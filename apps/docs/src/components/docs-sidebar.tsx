"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronDown, SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";

import { Link } from "@/i18n/navigation";
import {
  type DocsPageTree,
  getPagesFromFolder,
  type PageTreePage,
} from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent } from "@/registry/new-york-v4/ui/sidebar";

type NavigationPage = {
  id: string;
  label: ReactNode;
  searchLabel: string;
  url: string;
};

type NavigationGroup = {
  id: string;
  title: ReactNode;
  searchTitle: string;
  pages: NavigationPage[];
  count?: number;
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.026, delayChildren: 0.04 },
  },
};

const groupVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.2, 0, 0, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -3 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
};

const activeSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 38,
  mass: 0.65,
};

const sidebarLinkClassName = [
  "group/sidebar-link relative flex h-8 w-full min-w-0 items-center rounded-md px-2.5 pl-3.5 text-[0.83rem] font-medium",
  "outline-none transition-[background-color,color,transform] duration-150 ease-out",
  "hover:translate-x-px hover:bg-background hover:text-foreground hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--border)_65%,transparent)] dark:hover:bg-muted/40 dark:hover:shadow-none",
  "motion-reduce:transform-none motion-reduce:transition-none",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
].join(" ");

const sidebarScrollClassName = [
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 pt-1",
  "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--border)_45%,transparent)_transparent]",
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/40",
  "hover:[&::-webkit-scrollbar-thumb]:bg-border/60",
].join(" ");

function getTextLabel(value: ReactNode) {
  return typeof value === "string" ? value : String(value ?? "");
}

function createPage(page: PageTreePage, label: ReactNode = page.name) {
  return {
    id: page.$id ?? page.url,
    label,
    searchLabel: getTextLabel(label),
    url: page.url,
  };
}

function createNavigationGroups(tree: DocsPageTree) {
  const documentationPages = tree.children
    .filter((item): item is PageTreePage => item.type === "page")
    .map((page) => createPage(page));
  const groups: NavigationGroup[] = [];

  if (documentationPages.length > 0) {
    groups.push({
      id: "documentation",
      title: "Documentation",
      searchTitle: "Documentation",
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
        id: item.$id ?? item.index?.url ?? getTextLabel(item.name),
        title: item.name,
        searchTitle: getTextLabel(item.name),
        pages,
        count: pages.length - (item.index ? 1 : 0),
      });
    }
  }

  return groups;
}

function SidebarActiveIndicator({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.span
      layoutId="docs-sidebar-active-indicator"
      className="absolute inset-0 overflow-hidden rounded-md bg-background shadow-[0_0_0_1px_color-mix(in_oklab,var(--border)_70%,transparent)] dark:bg-muted/45 dark:shadow-none"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : activeSpring}
    >
      <span className="absolute inset-y-2 left-1.5 w-0.5 rounded-full bg-foreground/80 dark:bg-foreground/70" />
    </motion.span>
  );
}

function SidebarLink({
  page,
  pathname,
  shouldReduceMotion,
}: {
  page: NavigationPage;
  pathname: string;
  shouldReduceMotion: boolean;
}) {
  const isActive = page.url === pathname;

  return (
    <motion.li variants={shouldReduceMotion ? undefined : itemVariants}>
      <Link
        href={page.url}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          sidebarLinkClassName,
          isActive
            ? "text-foreground"
            : "text-foreground/65 dark:text-muted-foreground",
        )}
      >
        <AnimatePresence initial={false}>
          {isActive ? (
            <SidebarActiveIndicator shouldReduceMotion={shouldReduceMotion} />
          ) : null}
        </AnimatePresence>
        <motion.span
          className="relative z-10 truncate"
          animate={{ x: isActive && !shouldReduceMotion ? 3 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : activeSpring}
        >
          {page.label}
        </motion.span>
      </Link>
    </motion.li>
  );
}

function SidebarGroup({
  group,
  index,
  pathname,
  isOpen,
  isFiltering,
  shouldReduceMotion,
  onToggle,
}: {
  group: NavigationGroup;
  index: number;
  pathname: string;
  isOpen: boolean;
  isFiltering: boolean;
  shouldReduceMotion: boolean;
  onToggle: () => void;
}) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  const panelId = `${groupId}-panel`;

  return (
    <motion.section
      layout={!shouldReduceMotion}
      variants={shouldReduceMotion ? undefined : groupVariants}
      initial={isFiltering && !shouldReduceMotion ? "hidden" : undefined}
      animate="visible"
      exit={
        shouldReduceMotion
          ? undefined
          : { opacity: 0, y: -2, transition: { duration: 0.12 } }
      }
      aria-labelledby={labelId}
      className={cn(index > 0 && "mt-4")}
    >
      <h2 className="mb-1">
        <button
          id={labelId}
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          disabled={isFiltering}
          onClick={onToggle}
          className="group/header flex h-7 w-full items-center gap-2 rounded-md px-1.5 text-left outline-none transition-colors duration-150 hover:bg-background/75 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:hover:bg-muted/20"
        >
          <span className="shrink-0 font-semibold text-[0.64rem] text-foreground/60 uppercase tracking-[0.16em] dark:text-muted-foreground/75">
            {group.title}
          </span>
          {group.count !== undefined ? (
            <span className="rounded-full border border-border/75 bg-background px-1.5 py-px font-medium text-[9px] text-foreground/55 tabular-nums leading-none dark:border-border/30 dark:bg-muted/20 dark:text-muted-foreground/70">
              {group.count}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="h-px min-w-2 flex-1 bg-border/70 dark:bg-border/25"
          />
          <motion.span
            aria-hidden="true"
            className="flex text-foreground/55 dark:text-muted-foreground/55"
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
            key="group-content"
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
            <motion.ul
              variants={shouldReduceMotion ? undefined : containerVariants}
              className="space-y-px rounded-lg border border-border/65 bg-muted/55 p-0.5 dark:border-transparent dark:bg-muted/20"
            >
              {group.pages.map((page) => (
                <SidebarLink
                  key={page.id}
                  page={page}
                  pathname={pathname}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

export function DocsSidebar({
  tree,
  ...props
}: ComponentProps<typeof Sidebar> & { tree: DocsPageTree }) {
  const pathname = usePathname();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const groups = useMemo(() => createNavigationGroups(tree), [tree]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const isFiltering = normalizedQuery.length > 0;
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      pages: normalizedQuery
        ? group.pages.filter((page) =>
            `${group.searchTitle} ${page.searchLabel}`
              .toLocaleLowerCase()
              .includes(normalizedQuery),
          )
        : group.pages,
    }))
    .filter((group) => group.pages.length > 0);

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
    <Sidebar
      className="sticky top-[calc(var(--header-height)+0.75rem)] z-30 hidden h-[calc(100svh-var(--header-height)-1.5rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(64)] lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarContent className="relative mx-auto w-(--sidebar-menu-width) overflow-hidden bg-muted/35 py-0 dark:bg-background">
        <nav
          aria-label="Documentation navigation"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="sticky top-0 z-20  px-2 pb-3 pt-1 backdrop-blur-sm ">
            <label htmlFor={searchId} className="sr-only">
              Search components
            </label>
            <div className="group/search relative">
              <SearchIcon
                aria-hidden="true"
                className="-translate-y-1/2 pointer-events-none absolute left-2.5 top-1/2 size-3.5 text-muted-foreground transition-colors duration-200 group-focus-within/search:text-foreground"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search components..."
                autoComplete="off"
                spellCheck={false}
                aria-controls="docs-sidebar-groups"
                className="h-8 w-full rounded-lg border border-border/80 bg-background pl-8 pr-3 text-xs text-foreground shadow-[0_1px_0_color-mix(in_oklab,var(--border)_35%,transparent)] outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/75 hover:bg-muted/30 focus:border-ring/70 focus:bg-background focus:ring-2 focus:ring-ring/15 dark:border-border/40 dark:bg-muted/20 dark:shadow-none dark:hover:bg-muted/30"
              />
            </div>
          </div>
          <LayoutGroup id="documentation-sidebar">
            <motion.div
              id="docs-sidebar-groups"
              className={sidebarScrollClassName}
              variants={shouldReduceMotion ? undefined : containerVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {visibleGroups.map((group, index) => (
                  <SidebarGroup
                    key={group.id}
                    group={group}
                    index={index}
                    pathname={pathname}
                    isOpen={isFiltering || !collapsedGroups.has(group.id)}
                    isFiltering={isFiltering}
                    shouldReduceMotion={shouldReduceMotion}
                    onToggle={() => toggleGroup(group.id)}
                  />
                ))}
              </AnimatePresence>
              {visibleGroups.length === 0 ? (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-lg border border-border/50 bg-muted/20 px-3 py-4 text-center text-muted-foreground text-xs"
                >
                  No components found.
                </motion.div>
              ) : null}
            </motion.div>
          </LayoutGroup>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
