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

## Versioning and releases

The package follows [semver](https://semver.org). To cut a new release:

```sh
npm version patch   # or minor / major
npm publish
```

---

## Development

See [GETTING_STARTED.md](GETTING_STARTED.md) for local dev setup, running the GUI, and building the binary.
