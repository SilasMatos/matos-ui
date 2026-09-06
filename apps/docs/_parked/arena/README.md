# Arena — parked

The Arena component family is on hold pending a redesign. Nothing here is
wired into the site or the registry.

## To restore

1. Move the sources back:
   - `ui/*.tsx`      -> `apps/docs/src/registry/new-york-v4/ui/`
   - `examples/*.tsx` -> `apps/docs/src/registry/new-york-v4/examples/`
   - `lib/arena-motion.ts` -> `apps/docs/src/registry/new-york-v4/lib/`
   - `docs-content/*` -> `apps/docs/content/docs/arena/`
2. Uncomment the Arena blocks in `registry-ui.ts` and `registry-examples.ts`.
3. Add `"arena"` back to `apps/docs/content/docs/meta.json` pages.
4. `bun run --cwd apps/docs registry:build`, then `check` + `types:check`.

History: components landed in commits ad1ad5f (rally-court) and 405119c (hoop-shot).
