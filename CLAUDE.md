# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev                    # Run all apps (web:3000, docs:3001)
npm run build                  # Build all apps and packages
npm run lint                   # Lint all workspaces (ESLint, zero warnings enforced)
npm run check-types            # Type-check all workspaces
npm run format                 # Format with Prettier (ts, tsx, md files)

# Filter to a specific app/package
npm run dev --filter=web       # Run only the web app
npm run build --filter=docs    # Build only the docs app
```

## Architecture

This is a **Turborepo monorepo** using npm workspaces.

### Workspace Layout

- **`apps/web`** — Main Next.js app (App Router, port 3000)
- **`apps/docs`** — Docs Next.js app (App Router, port 3001)
- **`packages/ui`** (`@repo/ui`) — Shared React component library, exports from `src/*.tsx`
- **`packages/eslint-config`** (`@repo/eslint-config`) — Shared ESLint flat configs (`base`, `next-js`, `react-internal`)
- **`packages/typescript-config`** (`@repo/typescript-config`) — Shared tsconfig presets (`base`, `nextjs`, `react-library`)

### Key Conventions

- **Next.js 16 with App Router** — Pages in `app/` directory, not `pages/`
- **React 19** and **TypeScript 5.9** (target ES2022, strict mode, `noUncheckedIndexedAccess`)
- **ESLint 9 flat config** — Configs export arrays, not objects
- **UI package uses barrel-free exports** — Each component is a direct export (`@repo/ui/button`), not re-exported through an index file
- **No test framework configured** — No Jest/Vitest currently set up
