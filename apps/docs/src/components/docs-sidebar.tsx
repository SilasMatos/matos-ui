"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { type DocsPageTree, getPagesFromFolder } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent } from "@/registry/new-york-v4/ui/sidebar";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
};

export function DocsSidebar({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tree: DocsPageTree }) {
  const pathname = usePathname();

  return (
    <Sidebar
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarContent className="mx-auto no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2 py-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tree.children.map((item) => {
            const hasLink =
              item.type === "page" ||
              (item.type === "folder" && item.index && item.index.url);

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
                      "relative flex h-7 w-full items-center rounded-md px-2 text-[0.8rem] font-medium transition-colors",
                      isActive
                        ? "text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-md bg-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{item.name}</span>
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
                        "flex h-6 w-full items-center px-2 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors",
                        isFolderActive
                          ? "text-foreground"
                          : "text-muted-foreground/60 hover:text-muted-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="flex h-6 items-center px-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {item.name}
                    </p>
                  )}
                  <motion.div
                    className="mt-0.5 flex flex-col gap-px"
                    variants={sectionVariants}
                  >
                    {pages.map((page) => {
                      const isActive = page.url === pathname;
                      return (
                        <motion.div key={page.url} variants={itemVariants}>
                          <Link
                            href={page.url}
                            className={cn(
                              "relative flex h-7 w-full items-center rounded-md px-2 text-[0.8rem] transition-colors",
                              isActive
                                ? "text-background"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  layoutId="sidebar-active-bg"
                                  className="absolute inset-0 rounded-md bg-foreground"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                />
                              )}
                            </AnimatePresence>
                            <span className="relative z-10">{page.name}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              );
            }

            return null;
          })}
        </motion.div>
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
}
