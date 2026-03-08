---
id: p2-t06
phase: 2
title: corpo auth google
status: todo
blockedBy: p2-t04
---

# `corpo auth google`

One-time OAuth flow to authorize Corpo to read Google Docs on behalf of the
user. Required before `corpo import` can fetch a Google Doc URL.

## Behavior

```
corpo auth google
```

- Opens the Google OAuth consent screen in the user's default browser
- Listens on localhost for the OAuth redirect
- Stores the refresh token in `~/.corpo/credentials.toml` (never in the repo)
- On success, prints confirmation and indicates the user is ready to import

## Scope

- Use Google Docs API v1 (read-only scope: `https://www.googleapis.com/auth/documents.readonly`)
- Corpo ships with a registered OAuth client ID (public client, PKCE flow —
  no client secret stored in binary)
- Refresh token is stored locally and used silently on subsequent imports
- `corpo auth status` shows whether credentials are valid
- `corpo auth revoke` clears stored credentials

## Done when

- [ ] OAuth flow completes and stores a working refresh token
- [ ] `corpo import` can use stored credentials without re-prompting
- [ ] Credentials are stored outside the repo (`~/.corpo/`)
- [ ] Clear error message if auth is missing when `corpo import` is run
- [ ] `corpo auth status` and `corpo auth revoke` work
