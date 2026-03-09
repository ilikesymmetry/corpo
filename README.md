# Corpo

A document protocol for teams and agents that work with git repos.

Corpo stores docs as Markdown with YAML frontmatter, inside any existing git repo. Every doc gets a stable ID and a browsable GUI. Agents can read, write, and navigate corpo files without human help.

---

## Install

**Requires [Bun](https://bun.sh) ≥ 1.0.**

```sh
# global install
npm install -g corpo

# or, no install required
bunx corpo --help
```

---

## Quick start

```sh
# in any git repo (or create a new one)
git init my-repo && cd my-repo

# initialize corpo
corpo init

# create your first file
corpo new "My first doc" "A short description"

# browse it
corpo serve    # http://localhost:3000
```

---

## Commands

| Command | Description |
|---|---|
| `corpo init` | Initialize a new .corpo directory in the current directory |
| `corpo new` | Create a new corpo file |
| `corpo serve` | Start the local GUI server |
| `corpo threads` | List open threads in a file |
| `corpo reply` | Reply to a thread |
| `corpo resolve` | Resolve (close) a thread |
| `corpo lint` | Validate corpo files |

Run `corpo --help` or `corpo <command> --help` for full options.

---

## How it works

**Every doc is a Markdown file with YAML frontmatter**, stored in `.corpo/files/` inside your repo. The frontmatter holds machine-readable metadata. The body is plain Markdown.

**IDs are stable forever.** A doc's ID is assigned at creation (UUID v4, hyphens stripped) and never changes — rename files, reorganize directories, it doesn't matter.

**Threads live in the doc.** Comments and threads are stored as invisible HTML comments in the body and as structured data in frontmatter. Resolved threads are removed from the file and preserved only in git history.

**Repo permissions are access control.** Public repo = publicly readable. Private repo = login required. No separate permission layer.

---

## Structure

```
.corpo/
  config.json         # navigation tree, remote file refs
  files/
    <32-char-hex-id>.md
```

`config.json` example:

```json
{
  "navigation": [
    "a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d",
    {
      "group": "Architecture",
      "children": [
        "f1a2b3c4d5e64f7a8b9c0d1e2f3a4b5c"
      ]
    }
  ]
}
```

---

## Development

**Prerequisites:** [Bun](https://bun.sh) >= 1.0 and git.

```sh
bun install   # installs all workspace packages (packages/cli and packages/gui)
```

**Dev mode** — run in two separate terminals:

```sh
# Terminal 1 — API server
bun run dev:cli
# or: cd packages/cli && bun run src/index.ts serve

# Terminal 2 — GUI
bun run dev:gui
# or: cd packages/gui && bun run dev
```

The API server runs at `http://localhost:3000`. The Vite dev server runs at `http://localhost:5173` and proxies `/api/*` to port 3000.

**Build:**

```sh
bun run build

# or step by step from packages/cli:
bun run build:gui   # builds GUI dist and copies to packages/cli/gui/
bun run build       # compiles self-contained binary to packages/cli/dist/corpo
```

The compiled binary embeds the GUI assets and runs without Bun.

**Useful commands:**

| Command | Description |
|---|---|
| `bun run --cwd packages/cli src/index.ts --help` | List all commands (no build required) |
| `bun run --cwd packages/cli src/index.ts <cmd> --help` | Help for a specific command |

---

## Publishing

The package follows [semver](https://semver.org).

```sh
cd packages/cli
npm pack --dry-run   # verify package contents
npm version patch    # or minor / major
npm publish
```
