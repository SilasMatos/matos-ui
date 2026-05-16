"use client";

import {
  Archive,
  Bell,
  CheckCircle2,
  Copy,
  Eye,
  FilePenLine,
  History,
  PanelRightOpen,
  Rocket,
  Save,
  Search,
  Settings2,
  Share2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  InsetCommandDock,
  type InsetCommandDockAction,
  type InsetCommandDockGroup,
} from "@/registry/new-york-v4/ui/inset-command-dock";

const defaultGroups: InsetCommandDockGroup[] = [
  {
    id: "content",
    actions: [
      {
        id: "edit",
        label: "Edit",
        icon: <FilePenLine />,
      },
      {
        id: "preview",
        label: "Preview",
        icon: <Eye />,
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: <Copy />,
      },
    ],
  },
  {
    id: "workflow",
    actions: [
      {
        id: "publish",
        label: "Publish",
        icon: <Rocket />,
      },
      {
        id: "history",
        label: "History",
        icon: <History />,
      },
    ],
  },
];

const compactGroups: InsetCommandDockGroup[] = [
  {
    id: "inspect",
    actions: [
      {
        id: "search",
        label: "Search workspace",
        icon: <Search />,
      },
      {
        id: "assist",
        label: "Generate summary",
        icon: <Sparkles />,
      },
      {
        id: "panel",
        label: "Open side panel",
        icon: <PanelRightOpen />,
      },
    ],
  },
  {
    id: "settings",
    actions: [
      {
        id: "alerts",
        label: "Notification rules",
        icon: <Bell />,
      },
      {
        id: "settings",
        label: "Workspace settings",
        icon: <Settings2 />,
        disabled: true,
      },
    ],
  },
];

const floatingActions: InsetCommandDockAction[] = [
  {
    id: "save",
    label: "Save",
    icon: <Save />,
  },
  {
    id: "share",
    label: "Share",
    icon: <Share2 />,
  },
  {
    id: "approve",
    label: "Approve",
    icon: <CheckCircle2 />,
  },
  {
    id: "archive",
    label: "Archive",
    icon: <Archive />,
  },
];

const variations = [
  { id: "default", label: "Default" },
  { id: "compact", label: "Compact" },
  { id: "floating", label: "Floating" },
] as const;

type Variation = (typeof variations)[number]["id"];

export default function InsetCommandDockDemo() {
  const [variation, setVariation] = useState<Variation>("default");
  const [activeLabel, setActiveLabel] = useState("Edit");

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="inline-flex rounded-2xl border border-border bg-secondary p-1">
        {variations.map((item) => {
          const isActive = variation === item.id;

          return (
            <button
              key={item.id}
              type="button"
              data-active={isActive}
              onClick={() => setVariation(item.id)}
              className="rounded-xl px-3 py-1.5 text-muted-foreground text-xs font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-card data-[active=true]:text-foreground"
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-28 w-full items-center justify-center rounded-2xl border border-border bg-card/40 p-6">
        {variation === "default" ? (
          <InsetCommandDock
            groups={defaultGroups}
            defaultActiveId="edit"
            onAction={(action) => setActiveLabel(action.label)}
            status={{ label: activeLabel }}
          />
        ) : null}

        {variation === "compact" ? (
          <InsetCommandDock
            groups={compactGroups}
            defaultActiveId="search"
            showLabels={false}
            density="compact"
            shape="pill"
            onAction={(action) => setActiveLabel(action.label)}
            status={{ label: "Draft", state: "syncing" }}
          />
        ) : null}

        {variation === "floating" ? (
          <InsetCommandDock
            actions={floatingActions}
            defaultActiveId="save"
            variant="floating"
            shape="pill"
            onAction={(action) => setActiveLabel(action.label)}
            status={{ label: "Saved" }}
          />
        ) : null}
      </div>
    </div>
  );
}
