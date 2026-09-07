"use client";

import { Bell, Plus, Search, Settings } from "lucide-react";
import { useState } from "react";

import {
  Coachmark,
  type CoachmarkStep,
} from "@/registry/new-york-v4/ui/coachmark";

const STEPS: CoachmarkStep[] = [
  {
    target: "#cm-new",
    title: "Start here",
    description:
      "Create a project — or an issue, a doc, a view — from one place.",
  },
  {
    target: "#cm-search",
    title: "Jump anywhere",
    description: "Search across everything. It's also ⌘K from any screen.",
  },
  {
    target: "#cm-notifs",
    title: "Stay in the loop",
    description: "Mentions and assignments land here. Nothing else.",
    placement: "bottom",
  },
  {
    target: "#cm-settings",
    title: "Make it yours",
    description: "Theme, shortcuts, and workspace defaults live in settings.",
  },
];

export default function CoachmarkDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2">
        <button
          id="cm-new"
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 font-medium text-primary-foreground text-sm"
        >
          <Plus className="size-4" />
          New
        </button>
        <div className="flex items-center gap-1">
          <button
            id="cm-search"
            type="button"
            aria-label="Search"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Search className="size-4" />
          </button>
          <button
            id="cm-notifs"
            type="button"
            aria-label="Notifications"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4" />
          </button>
          <button
            id="cm-settings"
            type="button"
            aria-label="Settings"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex h-8 items-center rounded-lg border border-border px-3 font-medium text-sm hover:bg-muted"
      >
        Take the tour
      </button>

      <Coachmark
        steps={STEPS}
        open={open}
        onOpenChange={setOpen}
        onComplete={() => setOpen(false)}
      />
    </div>
  );
}
