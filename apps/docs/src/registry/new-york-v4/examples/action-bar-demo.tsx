"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionBar } from "@/registry/new-york-v4/ui/action-bar";
import { Button } from "@/registry/new-york-v4/ui/button";

export default function ActionBarDemo() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleConfirm() {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setIsEnabled(false);
    }, 1200);
  }

  return (
    <div className="relative  space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEnabled((v) => !v)}
        >
          {isEnabled ? "Desativar" : "Ativar"} Action Bar
        </Button>
      </div>

      {isEnabled && (
        <ActionBar
          placement="bottomCenter"
          tone="destructive"
          subject="Meu Workspace"
          icon={<Trash2 className="size-4 text-destructive" aria-hidden />}
          confirmLabel="Excluir"
          confirmLabelLoading="Excluindo..."
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
