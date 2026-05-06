"use client";

import {
  Bell,
  CalendarDays,
  Command,
  FileSearch,
  Layers3,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import {
  CommandDock,
  type CommandDockAction,
} from "@/registry/new-york-v4/ui/command-dock";

const actions: CommandDockAction[] = [
  {
    id: "command",
    label: "Open Command Center",
    description:
      "Jump into fuzzy search, recent files, and workflow shortcuts from one adaptive surface.",
    icon: <Command className="size-5" aria-hidden />,
    shortcut: "Cmd K",
    badge: "Live",
    tone: "primary",
  },
  {
    id: "search",
    label: "Inspect Files",
    description:
      "Scan the current workspace and surface the most relevant implementation paths.",
    icon: <FileSearch className="size-5" aria-hidden />,
    shortcut: "F",
  },
  {
    id: "layers",
    label: "Arrange Context",
    description:
      "Group related docs, decisions, and code references into a focused stack.",
    icon: <Layers3 className="size-5" aria-hidden />,
    shortcut: "L",
    tone: "success",
  },
  {
    id: "spark",
    label: "Generate Next Step",
    description:
      "Turn the selected context into a polished action, draft, or implementation prompt.",
    icon: <Sparkles className="size-5" aria-hidden />,
    shortcut: "G",
    tone: "warning",
  },
  {
    id: "calendar",
    label: "Schedule Follow-up",
    description:
      "Create a timed checkpoint with the relevant notes already attached.",
    icon: <CalendarDays className="size-5" aria-hidden />,
    shortcut: "S",
  },
  {
    id: "message",
    label: "Share Update",
    description:
      "Compose a concise status update using the current command context.",
    icon: <MessageSquareText className="size-5" aria-hidden />,
    shortcut: "U",
    tone: "primary",
  },
  {
    id: "alerts",
    label: "Quiet Notifications",
    description:
      "Mute low-priority activity while keeping critical handoff signals visible.",
    icon: <Bell className="size-5" aria-hidden />,
    shortcut: "Q",
  },
];

export default function CommandDockDemo() {
  const [activeAction, setActiveAction] = useState(actions[0]);

  return (
    <div className="flex w-full justify-center p-2">
      <div className="w-full max-w-[620px] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Smart dock
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              Contextual actions
            </h3>
          </div>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            {activeAction.label}
          </span>
        </div>

        <CommandDock
          actions={actions}
          defaultActiveId="command"
          panelTitle="Ready for action"
          panelDescription="Hover or focus an item to preview the command."
          onSelect={setActiveAction}
        />
      </div>
    </div>
  );
}
