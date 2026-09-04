"use client";

import { useState } from "react";
import { BouncyToggle } from "@/registry/new-york-v4/ui/bouncy-toggle";

export default function BouncyToggleDemo() {
  const [wifi, setWifi] = useState(true);
  const [sync, setSync] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[300px] space-y-4 py-6">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm font-medium">Wi-Fi</span>
        <BouncyToggle
          aria-label="Wi-Fi"
          checked={wifi}
          onCheckedChange={setWifi}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm font-medium">Background sync</span>
        <BouncyToggle
          aria-label="Background sync"
          checked={sync}
          onCheckedChange={setSync}
        />
      </div>
    </div>
  );
}
