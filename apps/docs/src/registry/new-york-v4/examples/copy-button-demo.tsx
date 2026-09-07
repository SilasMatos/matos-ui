"use client";

import { CopyButton, CopyField } from "@/registry/new-york-v4/ui/copy-button";

export default function CopyButtonDemo() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 py-6">
      <div className="flex items-center gap-3">
        <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground">
          usr_8Kd2mPqR7x
        </code>
        <CopyButton value="usr_8Kd2mPqR7xW3nL5vT" aria-label="Copy user ID" />
        <CopyButton value="usr_8Kd2mPqR7xW3nL5vT" label="Copy" />
      </div>

      <CopyField value="https://api.matos-ui.com/v1/webhooks/9f3c2a" />

      <CopyField secret value="key_9fK3c2a8Kd2mPqR7xW3nL5vTbQ8sJ" />
    </div>
  );
}
