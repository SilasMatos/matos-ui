"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { InlineSelect } from "@/registry/new-york-v4/ui/inline-select";

const STATUSES = [
  {
    value: "backlog",
    label: "Backlog",
    pill: "bg-muted text-muted-foreground",
  },
  { value: "active", label: "Active", pill: "bg-primary/12 text-foreground" },
  {
    value: "done",
    label: "Done",
    pill: "bg-secondary text-secondary-foreground",
  },
];

const RANK: Record<string, number> = { backlog: 0, active: 1, done: 2 };

type Row = { id: string; title: string; status: string };

const INITIAL: Row[] = [
  { id: "a", title: "Auth rewrite", status: "active" },
  { id: "b", title: "Design tokens", status: "done" },
  { id: "c", title: "Onboarding flow", status: "backlog" },
  { id: "d", title: "Search index", status: "active" },
  { id: "e", title: "Billing webhooks", status: "backlog" },
];

export default function InlineSelectDemo() {
  const [rows, setRows] = useState(INITIAL);

  const setStatus = (id: string, status: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  const sorted = [...rows].sort(
    (a, b) => RANK[a.status] - RANK[b.status] || a.title.localeCompare(b.title),
  );

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <p className="mb-2 text-muted-foreground text-xs">
        Sorted by status. Change one — the row travels, and the pill leads it.
      </p>
      <ul className="overflow-hidden rounded-xl border border-border">
        {sorted.map((row) => (
          <motion.li
            key={row.id}
            layout
            transition={spring.moderate}
            className="flex items-center justify-between gap-3 border-border border-b bg-background px-3 py-2.5 text-sm last:border-b-0"
          >
            <span className="min-w-0 truncate">{row.title}</span>
            <InlineSelect
              label={`Status of ${row.title}`}
              value={row.status}
              onValueChange={(s) => setStatus(row.id, s)}
              options={STATUSES}
              layoutId={`status-${row.id}`}
              align="end"
            />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
