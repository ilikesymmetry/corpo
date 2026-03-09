# Getting Started

## Prerequisites

- [Bun](https://bun.sh) >= 1.0 — runtime, package manager, and compiler
- git

## Install dependencies

```sh
bun install
```

This installs dependencies for all packages (`packages/cli` and `packages/gui`) via bun workspaces.

## Dev mode

Run these in two separate terminals.

**Terminal 1 — API server:**
```sh
bun run dev:cli
# or from packages/cli:
cd packages/cli && bun run src/index.ts serve
```
Starts the Hono API server at `http://localhost:3000`. Point it at a repo with a `.corpo/` directory by running from (or inside) that directory.

**Terminal 2 — GUI:**
```sh
bun run dev:gui
# or from packages/gui:
cd packages/gui && bun run dev
```
Starts the Vite dev server at `http://localhost:5173`. All `/api/*` requests are proxied to `localhost:3000`. Open `http://localhost:5173` in your browser.

## Build and compile

```sh
# Build everything (GUI + compiled CLI binary)
bun run build

# Or step by step from packages/cli:
cd packages/cli
bun run build:gui   # builds packages/gui/dist and copies to packages/cli/gui/dist
bun run build       # compiles self-contained binary to packages/cli/dist/corpo
```

The compiled binary at `packages/cli/dist/corpo` is self-contained — it embeds the GUI assets and runs without Bun.

## Quick publish check

```sh
cd packages/cli
npm pack --dry-run    # verify what goes into the npm package
npm publish           # publish to npm (bumps version first with npm version)
```

## Useful commands

| Command | Description |
|---|---|
| `bun run --cwd packages/cli src/index.ts --help` | List all commands (no build required) |
| `bun run --cwd packages/cli src/index.ts <cmd> --help` | Help for a specific command |
