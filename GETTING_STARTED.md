# Getting Started

## Prerequisites

- [Bun](https://bun.sh) >= 1.0 — runtime, package manager, and compiler
- [Node.js](https://nodejs.org) >= 18 — needed by Vite (viewer only)
- git

## Install dependencies

```sh
# CLI dependencies (incur, hono)
bun install

# Viewer dependencies (Vite, React, etc.)
cd viewer && bun install && cd ..
```

## Dev mode

Run these in two separate terminals.

**Terminal 1 — API server:**
```sh
bun run src/index.ts serve
```
Starts the Hono API server at `http://localhost:3000`. Point it at a corpus by
running from inside a directory that contains `.corpo/`:

```sh
cd /path/to/your/corpus
bun run /path/to/corpo/src/index.ts serve
```

**Terminal 2 — Viewer:**
```sh
cd viewer && bun run dev
```
Starts the Vite dev server at `http://localhost:5173`. All `/api/*` requests
are proxied to `localhost:3000`. Open `http://localhost:5173` in your browser.

## Production build

```sh
# 1. Build the viewer SPA into viewer/dist/
cd viewer && bun run build && cd ..

# 2. Compile the CLI binary with viewer/dist/ embedded
bun build --compile --minify src/index.ts --outfile corpo

# 3. Run everything from a single binary
cd /path/to/your/corpus && /path/to/corpo/corpo serve
```

## Initialize a new corpus

```sh
mkdir my-corpus && cd my-corpus && git init
corpo init         # creates .corpo/ and .corpo/config.json
corpo new --title "My first doc" --description "A short description"
corpo serve        # opens the viewer in your browser
```

## Useful commands

| Command | Description |
|---|---|
| `bun run src/index.ts --help` | List all commands (no build required) |
| `bun run src/index.ts <cmd> --help` | Help for a specific command |
| `bun test` | Run tests |
