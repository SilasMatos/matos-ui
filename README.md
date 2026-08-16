# Matos UI

Matos UI is a public component registry for teams building polished React and Next.js interfaces with Tailwind CSS and shadcn/ui.

The project provides ready-to-install UI components with focused APIs, accessible defaults, responsive layouts, and carefully tuned micro-interactions. Components are distributed through the shadcn CLI, so you copy the source into your own codebase instead of depending on a black-box package.

## Highlights

- Built for React, Next.js, Tailwind CSS, and shadcn/ui projects
- Installed directly into your app with `shadcn add`
- Source-first components you can customize freely
- Motion-rich interactions using Framer Motion where it adds clarity
- Registry JSON generated for individual components, demos, and full collections
- Documentation app powered by Next.js and Fumadocs

## Using the Registry

### Prerequisites

- A React or Next.js project using Tailwind CSS
- shadcn/ui initialized in the consuming project
- Node.js 18+ or Bun

If your project is not initialized with shadcn/ui yet:

```bash
npx shadcn@latest init
```

### Registry URL

Production registry:

```txt
https://matos-ui.com/r
```

Local development registry:

```txt
http://localhost:4000/r
```

### Install a Component

Use the shadcn CLI with a component JSON URL:

```bash
npx shadcn@latest add https://matos-ui.com/r/badge.json
```

More examples:

```bash
npx shadcn@latest add https://matos-ui.com/r/data-table.json
npx shadcn@latest add https://matos-ui.com/r/command-dock.json
npx shadcn@latest add https://matos-ui.com/r/file-upload.json
npx shadcn@latest add https://matos-ui.com/r/notification-stack.json
```

The CLI downloads the component source, places it in your project, and installs the required dependencies.

### Install a Demo

Each component can also ship with a demo:

```bash
npx shadcn@latest add https://matos-ui.com/r/badge-demo.json
npx shadcn@latest add https://matos-ui.com/r/data-table-demo.json
npx shadcn@latest add https://matos-ui.com/r/command-dock-demo.json
```

### Use the Component

After installation, import it from your local components folder:

```tsx
import { Badge } from "@/components/matos-ui/badge"

export function Example() {
  return <Badge>Ready</Badge>
}
```

## Available Components and Charts

The generated registry currently publishes 47 `registry:ui` items. `button` remains available as an internal registry dependency for composed components and blocks, but is no longer documented as a standalone component.

Core UI:

- `accordion`
- `action-bar`
- `badge`
- `elevated`
- `motion-tabs`
- `popover-card`
- `sheet-panel`
- `theme-toggler-button`

Data and operations:

- `command-dock`
- `data-table`
- `dynamic-island`
- `file-upload`
- `floating-action-menu`
- `inset-command-dock`
- `metric-card`
- `notification-stack`

Motion and cards:

- `bouncy-toggle`
- `feedback-card`
- `magnetic-card`
- `physics-counter`
- `process-timeline-engine`
- `reactive-button`
- `spotlight-card`
- `spring-slider`

Forms:

- `checkbox`
- `field`
- `form-grid`
- `form-section`
- `input`
- `otp-input`
- `password-input`
- `select`
- `textarea`

Charts:

- `activity-heatmap-chart`
- `activity-waveform-chart`
- `allocation-performance-chart`
- `animated-area-chart`
- `bubble-chart`
- `candlestick-chart`
- `impact-priority-matrix`
- `performance-waterfall-chart`
- `resource-treemap-chart`
- `score-radar-chart`
- `signal-flow-chart`
- `sparkline-card`
- `threshold-band-chart`

Most items include a matching `*-demo` registry item. The source of truth is `apps/docs/src/registry/registry-ui.ts`; generated JSON is written to `apps/docs/public/r`.

## Project Structure

```txt
apps/docs                         Documentation website and registry build
apps/docs/content/docs            MDX documentation pages
apps/docs/src/registry            Registry source definitions
apps/docs/src/registry/new-york-v4 Components and examples
apps/docs/public/r                Generated registry JSON files
packages/config                   Shared TypeScript configuration
```

## Local Development

Install dependencies:

```bash
bun install
```

Start the documentation app:

```bash
bun run dev
```

The docs app usually runs at:

```txt
http://localhost:4000
```

## Scripts

- `bun run dev` starts the development environment
- `bun run build` builds the production documentation app and registry
- `bun run check` runs Biome checks and formatting

Inside `apps/docs`:

- `bun run registry:build` regenerates registry JSON files
- `bun run types:check` generates docs types and runs TypeScript

## Adding a Component

1. Add the component source in `apps/docs/src/registry/new-york-v4/ui`.
2. Add a demo in `apps/docs/src/registry/new-york-v4/examples`.
3. Register both in `registry-ui.ts` and `registry-examples.ts`.
4. Add an MDX documentation page in `apps/docs/content/docs/components`.
5. Run:

```bash
bun run --cwd apps/docs registry:build
bun run --cwd apps/docs types:check
```

## Deployment

This repository builds the `apps/docs` Next.js app and serves it with the Next.js production server. The Docker runtime runs `bun run --filter docs start`, which starts `next start -p 4000`. It is not a static Nginx image.

Build the image:

```bash
docker build -t matos-ui/docs:prod .
```

Run the container:

```bash
docker run -d --name matos-ui-docs -p 4000:4000 --restart unless-stopped matos-ui/docs:prod
```

If a host reverse proxy should own public ports 80 and 443, bind the container to localhost instead:

```bash
docker run -d --name matos-ui-docs -p 127.0.0.1:8080:4000 --restart unless-stopped matos-ui/docs:prod
```

## DNS and HTTPS

For `matos-ui.com`:

1. Add an **A** record for `@` pointing to the public server IP.
2. Add `www` as a **CNAME** to `matos-ui.com`, or as an **A** record to the same IP.
3. Use Nginx or Caddy on the host for HTTPS with Let's Encrypt and proxy traffic to the local port bound by Docker, for example `http://127.0.0.1:8080` when using the localhost binding above.

## License

Matos UI is distributed under the MIT License. See [LICENSE](LICENSE).
