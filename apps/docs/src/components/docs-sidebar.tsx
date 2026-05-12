"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { type DocsPageTree, getPagesFromFolder } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent } from "@/registry/new-york-v4/ui/sidebar";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0 },
  },
};

const activeSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 36,
  mass: 0.7,
};

function SidebarActiveIndicator() {
  return (
    <AnimatePresence>
      <motion.span
        layoutId="sidebar-active-bg"
        className="absolute inset-0 overflow-hidden rounded-lg border border-foreground/10 bg-foreground/10 dark:border-white/10 dark:bg-white/20"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={activeSpring}
      >
        <motion.span
          className="absolute inset-y-1 left-1 w-1 rounded-full bg-foreground/55 dark:bg-white/70"
          layoutId="sidebar-active-rail"
          transition={activeSpring}
        />
        <motion.span
          className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-foreground/12 to-transparent dark:from-white/16"
          initial={{ x: -36, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        />
      </motion.span>
    </AnimatePresence>
  );
}

export function DocsSidebar({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tree: DocsPageTree }) {
  const pathname = usePathname();

  return (
    <Sidebar
      className="sticky top-[calc(var(--header-height)+0.75rem)] z-30 hidden h-[calc(100svh-var(--header-height)-1.5rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(60)] lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarContent className="relative mx-auto w-(--sidebar-menu-width) overflow-hidden px-2 py-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-background via-background/90 to-transparent" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="no-scrollbar h-full overflow-y-auto overflow-x-hidden py-5 pr-1"
        >
          {tree.children.map((item, index) => {
            const hasLink =
              item.type === "page" ||
              (item.type === "folder" && item.index && item.index.url);

            const isLast = index === tree.children.length - 1;

            if (item.type === "page") {
              const isActive = item.url === pathname;
              return (
                <motion.div
                  key={item.$id}
                  variants={itemVariants}
                  className="mb-0.5"
                >
                  <Link
                    href={item.url}
                    className={cn(
                      "relative flex h-8 w-full items-center rounded-lg px-3 text-[0.82rem] font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <AnimatePresence>
                      {isActive && <SidebarActiveIndicator />}
                    </AnimatePresence>
                    <motion.span
                      className="relative z-10"
                      animate={{ x: isActive ? 6 : 0 }}
                      transition={activeSpring}
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </motion.div>
              );
            }

            if (item.type === "folder") {
              const pages = getPagesFromFolder(item);
              const folderUrl =
                hasLink && item.type === "folder" && item.index
                  ? (item.index as { url: string }).url
                  : null;
              const isFolderActive = folderUrl === pathname;

              return (
                <motion.div
                  key={item.$id}
                  variants={itemVariants}
                  className="mb-3"
                >
                  {hasLink && folderUrl ? (
                    <Link
                      href={folderUrl}
                      className={cn(
                        "flex h-7 w-full items-center px-3 text-[0.78rem] font-semibold transition-colors",
                        isFolderActive
                          ? "text-foreground"
                          : "text-foreground/55 hover:text-foreground/80",
                      )}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="flex h-7 items-center px-3 text-[0.78rem] font-semibold text-foreground/45">
                      {item.name}
                    </p>
                  )}
                  <motion.div
                    className="mt-1 flex flex-col gap-0.5"
                    variants={sectionVariants}
                  >
                    {pages.map((page) => {
                      const isActive = page.url === pathname;
                      return (
                        <motion.div key={page.url} variants={itemVariants}>
                          <Link
                            href={page.url}
                            className={cn(
                              "relative flex h-8 w-full items-center rounded-lg px-3 text-[0.82rem] font-medium transition-colors",
                              isActive
                                ? "text-foreground"
                                : "text-foreground/70 hover:text-foreground",
                            )}
                          >
                            <AnimatePresence>
                              {isActive && <SidebarActiveIndicator />}
                            </AnimatePresence>
                            <motion.span
                              className="relative z-10"
                              animate={{ x: isActive ? 6 : 0 }}
                              transition={activeSpring}
                            >
                              {page.name}
                            </motion.span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                  {!isLast && <div className="h-2" aria-hidden="true" />}
                </motion.div>
              );
            }

            return null;
          })}
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-linear-to-t from-background via-background/90 to-transparent" />
      </SidebarContent>
    </Sidebar>
  );
}
