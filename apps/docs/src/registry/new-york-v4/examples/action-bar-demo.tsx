"use client";

import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { ActionBar } from "@/registry/new-york-v4/ui/action-bar";
import { Button } from "@/registry/new-york-v4/ui/button";

type Tone = "default" | "destructive" | "success" | "warning" | "info";

const toneOptions: { tone: Tone; label: string }[] = [
  { tone: "destructive", label: "Delete" },
  { tone: "success", label: "Publish" },
  { tone: "warning", label: "Archive" },
  { tone: "info", label: "Sync" },
];

const toneMeta: Record<
  Tone,
  {
    subject: string;
    confirmLabel: string;
    confirmLabelLoading: string;
    icon: ReactNode;
  }
> = {
  default: {
    subject: "Changes",
    confirmLabel: "Confirm",
    confirmLabelLoading: "Saving...",
    icon: <Info className="size-4 text-primary" aria-hidden />,
  },
  destructive: {
    subject: "My Workspace",
    confirmLabel: "Delete",
    confirmLabelLoading: "Deleting...",
    icon: <Trash2 className="size-4 text-destructive" aria-hidden />,
  },
  success: {
    subject: "Release notes",
    confirmLabel: "Publish",
    confirmLabelLoading: "Publishing...",
    icon: <CheckCircle2 className="size-4 text-primary" aria-hidden />,
  },
  warning: {
    subject: "Old reports",
    confirmLabel: "Archive",
    confirmLabelLoading: "Archiving...",
    icon: (
      <AlertTriangle className="size-4 text-muted-foreground" aria-hidden />
    ),
  },
  info: {
    subject: "Remote workspace",
    confirmLabel: "Sync",
    confirmLabelLoading: "Syncing...",
    icon: <Info className="size-4 text-primary" aria-hidden />,
  },
};

export default function ActionBarDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("destructive");
  const current = toneMeta[tone];

  function handleConfirm() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
    }, 1200);
  }

  return (
    <div className="relative space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Hide" : "Show"} Action Bar
        </Button>
        {toneOptions.map((option) => (
          <Button
            key={option.tone}
            type="button"
            variant={tone === option.tone ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setTone(option.tone);
              setIsOpen(true);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Rendered unconditionally and driven by `open`: an exit animation needs
          the bar to outlive the state change that dismisses it, which a
          `{isOpen && ...}` guard does not allow. It unmounts itself once the
          bar has finished sliding back down. */}
      <ActionBar
        open={isOpen}
        placement="bottomCenter"
        tone={tone}
        subject={current.subject}
        icon={current.icon}
        confirmLabel={current.confirmLabel}
        confirmLabelLoading={current.confirmLabelLoading}
        actions={{
          onCancel: () => setIsOpen(false),
          onConfirm: handleConfirm,
          isLoading,
        }}
      />
    </div>
  );
}
