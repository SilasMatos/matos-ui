"use client";

import { useState } from "react";

import { EditInPlace } from "@/registry/new-york-v4/ui/edit-in-place";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export default function EditInPlaceDemo() {
  const [name, setName] = useState("Quarterly planning");
  const [summary, setSummary] = useState(
    "Roadmap, headcount and budget for Q3.",
  );
  const [owner, setOwner] = useState("");
  const [budget, setBudget] = useState("42,000");

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <Elevated offset={1} className="rounded-2xl p-5">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Project
        </p>

        <div className="mt-1">
          <EditInPlace
            label="Project name"
            value={name}
            onValueChange={setName}
            size="lg"
          />
        </div>

        <div className="mt-0.5">
          <EditInPlace
            label="Summary"
            value={summary}
            onValueChange={setSummary}
            placeholder="Add a summary"
          />
        </div>

        <dl className="mt-5 flex flex-col gap-3 border-border border-t pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="flex min-w-0 justify-end">
              <EditInPlace
                label="Owner"
                value={owner}
                onValueChange={setOwner}
                placeholder="Unassigned"
                size="sm"
              />
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Budget (USD)</dt>
            <dd className="flex min-w-0 justify-end">
              <EditInPlace
                label="Budget"
                value={budget}
                onValueChange={setBudget}
                size="sm"
                validate={(v) =>
                  /^[0-9,]+$/.test(v.trim()) || "Numbers and commas only."
                }
                renderValue={(v) => <span className="tabular-nums">${v}</span>}
              />
            </dd>
          </div>
        </dl>
      </Elevated>
    </div>
  );
}
