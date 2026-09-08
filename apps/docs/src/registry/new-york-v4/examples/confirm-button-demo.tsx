"use client";

import { useState } from "react";

import { ConfirmButton } from "@/registry/new-york-v4/ui/confirm-button";

const INITIAL = [
  { id: "1", name: "Q3 forecast.xlsx" },
  { id: "2", name: "Brand assets.zip" },
  { id: "3", name: "Meeting notes.md" },
];

export default function ConfirmButtonDemo() {
  const [rows, setRows] = useState(INITIAL);
  const [log, setLog] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-6">
      <ul className="flex flex-col rounded-xl border border-border p-1">
        {rows.length === 0 ? (
          <li className="px-3 py-8 text-center text-muted-foreground text-sm">
            Nothing left.{" "}
            <button
              type="button"
              onClick={() => setRows(INITIAL)}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Restore
            </button>
          </li>
        ) : (
          rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">{row.name}</span>
              <ConfirmButton
                label={`Delete ${row.name}`}
                onConfirm={() =>
                  setRows((r) => r.filter((x) => x.id !== row.id))
                }
              />
            </li>
          ))
        )}
      </ul>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
        <span>Revoke API key — async confirm</span>
        <ConfirmButton
          label="Revoke API key"
          confirmLabel="Revoke"
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1400))}
          onCancel={() => setLog("Kept the key.")}
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
        <span>Clear draft — neutral, auto-cancels in 3s</span>
        <ConfirmButton
          label="Clear draft"
          confirmLabel="Clear"
          variant="default"
          timeout={3000}
          defaultFocus="confirm"
          onConfirm={() => setLog("Draft cleared.")}
        />
      </div>

      <p className="h-4 text-muted-foreground text-xs" aria-live="polite">
        {log}
      </p>
    </div>
  );
}
