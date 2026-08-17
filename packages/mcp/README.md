# @matos-ui/mcp

A read-only [MCP](https://modelcontextprotocol.io) server for [Matos UI](https://matos-ui.com). It exposes the live component/block/palette registry to AI coding agents (Claude Code, Cursor, etc.) as a set of tools.

## Why this exists

Matos UI already follows the shadcn registry spec, so generic third-party MCPs that speak that protocol can likely install Matos UI components today just by pointing at `https://matos-ui.com/r/*.json`. This server isn't trying to replace that. It exists to expose what's specific to Matos UI as **queryable knowledge** — the Surface Philosophy (`Elevated`, elevation offsets, substrate nesting) and Motion Tokens (`spring` tiers, `motionForOffset`) — instead of leaving that knowledge locked in prose docs an agent has to guess at.

## Security

This server is **read-only and side-effect-free**:

- No tool executes a shell command, writes a file, or installs anything.
- Every tool returns data (JSON/text). If you ask an agent to install a component, the agent's own tools run `shadcn add ...` — this server never does.
- No sensitive environment variables or filesystem access beyond what's needed to run the Node process itself.
- The only configurable input is `MATOS_UI_REGISTRY_URL`, which points the server at a registry base; it is never used to read secrets.

> **Status:** not published yet. `matos-ui.com` is currently behind the `dev`
> branch (missing blocks, palettes, several components), so the registry-backed
> tools (`list_components`, `list_blocks`, `list_palettes`, `get_item`,
> `get_install_command`) require `MATOS_UI_REGISTRY_URL` to be set explicitly —
> there is no default, so they fail clearly instead of silently serving stale
> data. A `https://matos-ui.com` default will come back once production is
> back in sync with `dev`, ahead of the npm publish.

## Install

```bash
claude mcp add matos-ui -- npx -y @matos-ui/mcp@latest
```

## Tools

Registry-backed (need `MATOS_UI_REGISTRY_URL`):

| Tool | Description |
| --- | --- |
| `list_components` | List components (`registry:ui`/`registry:lib`/`registry:hook`), optionally filtered by `type`. |
| `list_blocks` | List composed, page-level blocks (dashboards, settings screens, etc). |
| `list_palettes` | List color palettes with a primary-color preview for light/dark. |
| `get_item` | Fetch the full registry entry for a single item by name (file contents, deps, cssVars). |
| `get_install_command` | Build the ready-to-run `shadcn add` command for an item, for npm/pnpm/yarn/bun. |
| `find_component_for` | Keyword-search components/blocks by use case (name/description/dependency overlap, no embeddings). |

Docs-sourced (read live from GitHub, no registry needed):

| Tool | Description |
| --- | --- |
| `get_surface_philosophy` | The Elevated primitive, substrate context, and elevation offset conventions — fetched from `elevated.mdx` so it can't drift from what's documented. |
| `get_motion_guidance` | The Motion Tokens spring tiers, `motionForOffset`, `staggerContainer` — returns the actual `motion-tokens.ts` source (code + JSDoc). |
| `get_theme_options` | The 4 color palettes (registry, needs config) + the 4 radius presets (docs source, no config needed) in one call. |

## Development

```bash
bun install
bun run --cwd packages/mcp build
bun run --cwd packages/mcp check-types

# Point at a local docs dev server instead of production:
npx @modelcontextprotocol/inspector --cli node packages/mcp/dist/index.js \
  -e MATOS_UI_REGISTRY_URL=http://localhost:4000 \
  --method tools/list
```
