---
id: p2-t04
phase: 2
title: CLI project setup + install script
status: todo
blocks: p2-t05, p2-t06, p2-t07, p2-t08, p2-t09, p2-t10
---

# CLI project setup + install script

Bootstrap the Rust CLI project and publish a `curl | sh` install script so
the tool can be distributed without requiring Cargo or any runtime.

## Scope

- Initialize Rust project with a CLI argument parsing library (recommend
  `clap` for subcommand structure)
- Define the top-level command structure: `corpo <subcommand> [args] [flags]`
- Set up GitHub Actions to build release binaries for macOS (arm64, x86_64)
  and Linux (x86_64) on every tagged release
- Write `install.sh` — detects OS/arch, downloads the correct binary from
  GitHub releases, places it in `/usr/local/bin`
- Host `install.sh` at a stable URL (GitHub raw or a redirect from `corpo.sh`)

## Done when

- [ ] `cargo build` produces a working binary
- [ ] `corpo --help` outputs a clean command listing
- [ ] GitHub Actions builds and uploads release binaries on tag push
- [ ] `curl -fsSL https://corpo.sh/install | sh` installs the binary and
      prints a success message
- [ ] Install script handles macOS arm64, macOS x86_64, Linux x86_64
