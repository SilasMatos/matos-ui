import { CodeBlockCommandWrapper } from "@/components/code-block-command";

const runners = {
  pnpm: "pnpm dlx",
  npm: "npx -y",
  yarn: "yarn dlx",
  bun: "bunx -y",
} as const;

export function McpInstallClaude() {
  return (
    <CodeBlockCommandWrapper
      __pnpm__={`claude mcp add matos-ui -- ${runners.pnpm} @matos-ui/mcp@latest`}
      __npm__={`claude mcp add matos-ui -- ${runners.npm} @matos-ui/mcp@latest`}
      __yarn__={`claude mcp add matos-ui -- ${runners.yarn} @matos-ui/mcp@latest`}
      __bun__={`claude mcp add matos-ui -- ${runners.bun} @matos-ui/mcp@latest`}
    />
  );
}

export function McpInstallManual() {
  return (
    <CodeBlockCommandWrapper
      __pnpm__={`${runners.pnpm} @matos-ui/mcp@latest`}
      __npm__={`${runners.npm} @matos-ui/mcp@latest`}
      __yarn__={`${runners.yarn} @matos-ui/mcp@latest`}
      __bun__={`${runners.bun} @matos-ui/mcp@latest`}
    />
  );
}
