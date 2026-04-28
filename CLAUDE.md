# RYex — CLAUDE.md

Project rulebook. Read this before any work in this repo.

---

## What this repo is

RYex is the Capital Layer for Perp Markets. This repo holds the **public-facing landing page + interactive app prototype** at https://ryex.finance.

- `app/` — Next.js 14 App Router routes
- `app/page.tsx` — Landing page (hero → final CTA)
- `app/app/*` — Protocol app routes (trade, rtoken, ryield, swap, pool, liquidation, dashboard)
- `components/landing/` — Landing-only components
- `components/app/` — App-only components
- `components/ui/` — Shared primitives (buttons, cards, modals)
- `lib/` — Hooks, utils, mock data
- `public/` — Static assets

Hosted on Cloudflare Pages with auto-deploy on push to `main`. Domain `ryex.finance` is configured.

---

## DANGER ZONE — do not modify without explicit approval

- `next.config.mjs` — `output: 'export'` is required for Cloudflare Pages static deploy. Removing it breaks production.
- `app/layout.tsx` — root metadata. Affects SEO and social previews. Coordinate before changing.
- Any file in `contracts/` (when added in Phase 4) — Solidity contracts. Audit before changing.

---

## Build & verification

```bash
npm install        # install deps
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build → out/
npm run type-check # TypeScript check, no emit
npm run lint       # next lint
```

Production build outputs to `out/`. Cloudflare Pages serves from there.

---

## Architecture rules

1. **Pages** are thin — they compose components. No business logic in page files.
2. **Components** are dumb by default. Side effects go in hooks.
3. **`'use client'`** only when interactivity is required (state, effects, handlers). Default to server components.
4. **Mock data** lives in `lib/mockData.ts`. In Phase 4 it gets replaced with on-chain reads via wagmi/viem.
5. **No global state library** until justified. Local `useState` first; Zustand if cross-page state grows.
6. **Venue adapter pattern** is mandatory when contracts ship — do NOT bake GMX-specific logic into core contracts.

---

## Style conventions

- **Typography**: Inter for UI, JetBrains Mono for numbers/labels
- **Color tokens**: Use CSS custom properties (`var(--lime)`, `var(--cobalt)`, etc.) — never raw hex
- **Spacing**: prefer `clamp()` for fluid sizes
- **Hyphens in copy**: `ERC-20` is the only allowed hyphenated form. Avoid em dashes; use periods or commas.
- **rToken / rYield**: protocol primitives. Always camelCase, never RTOKEN or all-caps.

---

## Known gotchas

- **Static export limits**: no API routes, no server components with dynamic data fetching, no `next/image` optimization. Use `<img>` directly or pre-build SVGs.
- **Cloudflare Pages build settings**: `Build command: npm run build` · `Build output directory: out`
- **GMX v2 borrow fees** (when contracts ship): rYield APR display must show "net of borrow fees", not raw funding rate.
- **Hyperliquid integration** is Phase 2. Do not bake HyperEVM logic into core contracts now.

---

## Workflow with the design team

Designer: 렌디 — works in Figma file `Slwnix49UONprKuJuFUCFi`.

Process:
1. Designer updates Figma → notifies via Telegram
2. Joseph relays to Claude (Cowork session or Claude Code session)
3. Claude reads Figma via MCP → translates components → updates code
4. Joseph commits + pushes → Cloudflare auto-deploys

Component naming must match between Figma and code:
- Figma `Button/Primary/MD` ↔ React `<Button variant="primary" size="md">`
- Figma `Card/Position` ↔ React `<PositionCard>`
- Figma `Modal/Redeem` ↔ React `<RedeemModal>`

Design tokens stay in sync between Figma Variables, `tailwind.config.ts`, and `app/globals.css`.

---

## Contact

- Joseph: Telegram @zzarong
- X: https://x.com/RYex_finance
