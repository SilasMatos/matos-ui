"use client";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { Terminal } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

export function TerminalBlock({
  code,
  lang = "bash",
  label,
}: {
  code: string;
  lang?: string;
  label?: string;
}) {
  return (
    <div className="not-prose relative my-6 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-3 py-2">
        <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
          <Terminal className="size-3 text-background" />
        </div>
        <span className="font-mono text-muted-foreground text-xs">
          {label ?? lang}
        </span>
      </div>
      <div className="relative">
        <CodeBlock
          allowCopy={false}
          className="my-0 rounded-none border-0 bg-transparent px-3 py-1"
        >
          <Pre className="text-sm">
            <code data-language={lang} className="font-mono leading-relaxed">
              {code}
            </code>
          </Pre>
        </CodeBlock>
        <CopyButton value={code} className="absolute top-2 right-2" />
      </div>
    </div>
  );
}
