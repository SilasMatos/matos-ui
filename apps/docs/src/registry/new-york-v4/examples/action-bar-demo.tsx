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
    subject: "Meu Workspace",
    confirmLabel: "Excluir",
    confirmLabelLoading: "Excluindo...",
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
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("destructive");
  const current = toneMeta[tone];

  function handleConfirm() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setIsEnabled(false);
    }, 1200);
  }

  return (
    <div className="relative  space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEnabled((v) => !v)}
        >
          {isEnabled ? "Desativar" : "Ativar"} Action Bar
        </Button>
        {toneOptions.map((option) => (
          <Button
            key={option.tone}
            type="button"
            variant={tone === option.tone ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setTone(option.tone);
              setIsEnabled(true);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isEnabled && (
        <ActionBar
          placement="bottomCenter"
          tone={tone}
          subject={current.subject}
          icon={current.icon}
          confirmLabel={current.confirmLabel}
          confirmLabelLoading={current.confirmLabelLoading}
          actions={{
            onCancel: () => setIsEnabled(false),
            onConfirm: handleConfirm,
            isLoading,
          }}
        />
      )}
    </div>
  );
}
