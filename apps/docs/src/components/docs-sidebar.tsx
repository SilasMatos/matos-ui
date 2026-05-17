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
    transition: { staggerChildren: 0.018, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.014, delayChildren: 0 },
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
    <motion.span
      layoutId="sidebar-active-bg"
      className="absolute inset-y-0 left-0 right-0 overflow-hidden rounded-lg border border-border/60 bg-muted/80 shadow-sm"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={activeSpring}
    >
      <motion.span
        className="absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-foreground/18 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
      />
    </motion.span>
  );
}

const sidebarLinkClassName =
  "group/sidebar-link relative flex h-8 w-full items-center rounded-lg px-3 text-[0.84rem] font-medium outline-none transition-[background-color,color,transform] duration-75 ease-out hover:translate-x-0.5 hover:bg-muted/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sidebarScrollClassName = [
  "relative z-10 h-full overflow-y-auto overflow-x-hidden py-4 pl-7 pr-2",
  "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/70",
  "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
].join(" ");

export function DocsSidebar({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tree: DocsPageTree }) {
  const pathname = usePathname();

  return (
    <Sidebar
      className="sticky top-[calc(var(--header-height)+0.75rem)] z-30 hidden h-[calc(100svh-var(--header-height)-1.5rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(62)] lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarContent className="relative mx-auto w-(--sidebar-menu-width) overflow-hidden py-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1 top-4 z-0 w-4 opacity-40 [background-image:repeating-linear-gradient(to_bottom,var(--muted-foreground)_0_1px,transparent_1px_8px)] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-linear-to-b from-background via-background/90 to-transparent" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={sidebarScrollClassName}
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
                      sidebarLinkClassName,
                      isActive ? "text-foreground" : "text-muted-foreground/85",
                    )}
                  >
                    <AnimatePresence initial={false}>
                      {isActive && <SidebarActiveIndicator />}
                    </AnimatePresence>
                    <motion.span
                      className="relative z-10"
                      animate={{ x: isActive ? 4 : 0 }}
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
                        "relative flex h-7 w-full uppercase items-center rounded-md px-3 text-[0.80rem] font-semibold outline-none transition-colors duration-75 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isFolderActive
                          ? "text-foreground"
                          : "text-muted-foreground/70 hover:text-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="flex h-7 items-center px-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
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
                              sidebarLinkClassName,
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground/85",
                            )}
                          >
                            <AnimatePresence initial={false}>
                              {isActive && <SidebarActiveIndicator />}
                            </AnimatePresence>
                            <motion.span
                              className="relative z-10"
                              animate={{ x: isActive ? 4 : 0 }}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 bg-linear-to-t from-background via-background/90 to-transparent" />
      </SidebarContent>
    </Sidebar>
  );
}
