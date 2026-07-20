"use client";

import { PanelLeft, Plus, Search } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import { NavSection } from "./components/nav-section";
import { UserMenu } from "./components/user-menu";
import { navGroups } from "./data";

export function SidebarSurface01() {
  const [activeId, setActiveId] = useState("dashboard");

  return (
    // The app background is the base substrate (level 1).
    <SurfaceProvider value={1}>
      <div
        data-slot="sidebar-surface-01"
        className={twMerge(
          "@container/shell w-full overflow-hidden rounded-2xl text-foreground",
          surfaceClasses(1),
        )}
      >
        <div className="flex min-h-[26rem] gap-3 p-3">
          {/* Sidebar — lifts one step off the app background (level 2). */}
          <Elevated
            offset={1}
            className="flex w-full shrink-0 flex-col rounded-xl p-2.5 @2xl/shell:w-64"
          >
            <div className="flex items-center gap-2 px-1.5 pb-2.5">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
              >
                A
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
                Acme Inc
              </span>
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="grid size-7 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PanelLeft className="size-4" aria-hidden="true" />
              </button>
            </div>

            <label className="relative mb-2 block">
              <span className="sr-only">Search</span>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search…"
                className="h-8 w-full rounded-lg bg-surface-1 pl-8 pr-2 text-sm text-foreground shadow-surface-1 outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <nav className="flex-1 space-y-3 overflow-y-auto">
              {navGroups.map((group) => (
                <NavSection
                  key={group.id}
                  group={group}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
              ))}
            </nav>

            <div className="mt-3 border-border/60 border-t pt-2.5">
              <UserMenu />
            </div>
          </Elevated>

          {/* Content stays on the app background (level 1) so the sidebar and
              its cards visibly lift off of it. Hidden on narrow containers. */}
          <div className="hidden min-w-0 flex-1 flex-col gap-3 @2xl/shell:flex">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  Dashboard
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  Everything reads its substrate.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" aria-hidden="true" />
                New
              </button>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">
              {["Active projects", "Deployments"].map((title) => (
                <Elevated
                  key={title}
                  offset={1}
                  className="flex flex-col gap-3 rounded-xl p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {title}
                  </p>
                  <div className="h-2 w-2/3 rounded-full bg-surface-4" />
                  <div className="h-2 w-1/2 rounded-full bg-surface-4" />
                  <div className="mt-auto h-2 w-3/4 rounded-full bg-surface-3" />
                </Elevated>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SurfaceProvider>
  );
}
