# RYex

The Capital Layer for Perp Markets. Live at https://ryex.finance.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with custom design tokens
- Static export → Cloudflare Pages

## Develop

```bash
npm install
npm run dev   # http://localhost:3000
```

## Build

```bash
npm run build  # outputs to ./out (static)
```

## Deploy

Push to `main`. Cloudflare Pages picks up the build automatically.

**Cloudflare Pages settings**:
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: (empty)
- Node version: 20

## Read me first

See [CLAUDE.md](./CLAUDE.md) for project rules, architecture, and workflow.
