---
id: p4-t15
phase: 4
title: corpo.sh — deploy
status: todo
blockedBy: p4-t14
---

# corpo.sh — deploy

Deploy the corpo.sh backend and wire it to the domain.

## Scope

- Create Vercel project, connect to the corpo repo (or a separate
  `ilikesymmetry/corpo-sh` repo if backend code lives separately)
- Provision Vercel KV store
- Configure `corpo.sh` domain in Vercel
- Set up environment variables (KV connection string, any secrets)
- Verify `corpo publish` from the CLI hits the live endpoint correctly
- Verify `corpo.sh/{id}` resolves and renders a real doc end-to-end

## Done when

- [ ] `corpo.sh` resolves to the Vercel deployment
- [ ] `POST https://corpo.sh/api/docs` registers a doc successfully
- [ ] `https://corpo.sh/{id}` renders a published doc in the browser
- [ ] `curl -fsSL https://corpo.sh/install | sh` serves the install script
